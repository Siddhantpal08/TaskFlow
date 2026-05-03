const asyncWrapper = require('../utils/asyncWrapper');
const taskService = require('../services/taskService');
const taskModel = require('../models/taskModel');
const { emitToUser } = require('../utils/socket');
const notificationService = require('../services/notificationService');
const mailer = require('../utils/mailer');
const Joi = require('joi');

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createTaskSchema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(5000).allow('', null).optional(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    assigned_to: Joi.number().integer().positive().required(),
    due_date: Joi.string().isoDate().allow(null, '').optional(),
});

const updateTaskSchema = Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(5000).allow('', null).optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    due_date: Joi.string().isoDate().allow(null, '').optional(),
    assigned_to: Joi.number().integer().positive().optional(),
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'active', 'pending_approval', 'done', 'refused').required(),
});

const delegateSchema = Joi.object({
    assigned_to: Joi.number().integer().positive().required(),
});

const bulkDeleteSchema = Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validateBody = (schema, body) => {
    const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'")).join('; ');
        throw { statusCode: 422, message: messages, status: 'fail' };
    }
    return value;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/** GET /api/v1/tasks */
const listTasks = asyncWrapper(async (req, res) => {
    const { status, priority, assignee } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignee) filters.assignee = parseInt(assignee, 10);

    const tasks = await taskModel.getTasksForUser(req.user.id, filters);
    res.status(200).json({ success: true, data: tasks });
});

/** POST /api/v1/tasks */
const createTask = asyncWrapper(async (req, res) => {
    const data = validateBody(createTaskSchema, req.body);
    if (data.due_date) data.due_date = String(data.due_date).slice(0, 10);
    const task = await taskService.createTask(req.user.id, data);

    // Notify assignee (unless assigning to self)
    if (data.assigned_to !== req.user.id) {
        await notificationService.sendNotification(
            data.assigned_to,
            'task_assigned',
            `You have been assigned a new task: "${task.title}"`,
            task.id
        );
        const userModel = require('../models/userModel');
        const [assignee, sender] = await Promise.all([
            userModel.getUserById(data.assigned_to),
            userModel.getUserById(req.user.id),
        ]);
        if (assignee && assignee.email) {
            await mailer.sendTaskAssignedEmail(assignee.email, task.title, sender?.name || 'A teammate');
        }
    }

    // Emit real-time event to assignee
    emitToUser(String(data.assigned_to), 'task:assigned', task);

    res.status(201).json({ success: true, data: task });
});

/** GET /api/v1/tasks/:id */
const getTask = asyncWrapper(async (req, res) => {
    const task = await taskService.getTask(parseInt(req.params.id, 10), req.user.id);
    const subTasks = await taskModel.getSubTasks(task.id);
    res.status(200).json({ success: true, data: { ...task, subTasks } });
});

/** PUT /api/v1/tasks/:id */
const updateTask = asyncWrapper(async (req, res) => {
    const data = validateBody(updateTaskSchema, req.body);
    if (data.due_date) data.due_date = String(data.due_date).slice(0, 10);
    const task = await taskService.updateTask(parseInt(req.params.id, 10), req.user.id, data);

    emitToUser(String(task.assigned_to), 'task:updated', task);

    res.status(200).json({ success: true, data: task });
});

/** PATCH /api/v1/tasks/:id/status */
const updateStatus = asyncWrapper(async (req, res) => {
    const data = validateBody(updateStatusSchema, req.body);
    const task = await taskService.updateStatus(parseInt(req.params.id, 10), req.user.id, data.status);

    // Notify the task creator about status change
    if (task.assigned_by !== req.user.id) {
        await notificationService.sendNotification(
            task.assigned_by,
            'status_update',
            `Task "${task.title}" status changed to ${data.status}.`,
            task.id
        );

        const userModel = require('../models/userModel');
        const [assigner, changer] = await Promise.all([
            userModel.getUserById(task.assigned_by),
            userModel.getUserById(req.user.id),
        ]);

        if (assigner && assigner.email) {
            if (data.status === 'refused') {
                await mailer.sendTaskRefusedEmail(assigner.email, task.title, changer?.name || 'A teammate');
            } else if (data.status === 'pending_approval') {
                await mailer.sendTaskPendingApprovalEmail(assigner.email, task.title, changer?.name || 'A teammate');
            }
        }
    }

    // If the assigner changes status of a pending_approval task
    if (task.assigned_by === req.user.id && task.assigned_to !== req.user.id) {
        const userModel = require('../models/userModel');
        const assignee = await userModel.getUserById(task.assigned_to);

        if (assignee && assignee.email) {
            if (data.status === 'done') {
                await mailer.sendTaskApprovedEmail(assignee.email, task.title);
            } else if (data.status === 'active') {
                await mailer.sendTaskRejectedEmail(assignee.email, task.title);
            }
        }
    }

    emitToUser(String(task.assigned_by), 'task:updated', task);
    emitToUser(String(task.assigned_to), 'task:updated', task);

    res.status(200).json({ success: true, data: task });
});

/** PATCH /api/v1/tasks/:id/delegate */
const delegateTask = asyncWrapper(async (req, res) => {
    const data = validateBody(delegateSchema, req.body);
    const childTask = await taskService.delegateTask(
        parseInt(req.params.id, 10),
        req.user.id,
        data.assigned_to
    );

    // Notify new assignee
    await notificationService.sendNotification(
        data.assigned_to,
        'task_delegated',
        `A task has been delegated to you: "${childTask.title}"`,
        childTask.id
    );
    const userModel = require('../models/userModel');
    const [assignee, delegator] = await Promise.all([
        userModel.getUserById(data.assigned_to),
        userModel.getUserById(req.user.id),
    ]);
    if (assignee && assignee.email) {
        await mailer.sendTaskAssignedEmail(assignee.email, childTask.title, delegator?.name || 'A teammate');
    }

    emitToUser(String(data.assigned_to), 'task:delegated', childTask);

    res.status(201).json({ success: true, data: childTask });
});

/** DELETE /api/v1/tasks/:id */
const deleteTask = asyncWrapper(async (req, res) => {
    await taskService.deleteTask(parseInt(req.params.id, 10), req.user.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
});

/** DELETE /api/v1/tasks (bulk) */
const bulkDelete = asyncWrapper(async (req, res) => {
    const data = validateBody(bulkDeleteSchema, req.body);
    const result = await taskService.bulkDeleteTasks(data.ids, req.user.id);
    res.status(200).json({ success: true, data: result });
});

module.exports = {
    listTasks,
    createTask,
    getTask,
    updateTask,
    updateStatus,
    delegateTask,
    deleteTask,
    bulkDelete,
};
