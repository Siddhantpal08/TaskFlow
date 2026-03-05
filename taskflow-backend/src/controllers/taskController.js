const asyncWrapper = require('../utils/asyncWrapper');
const taskService = require('../services/taskService');
const taskModel = require('../models/taskModel');
const { emitToUser } = require('../utils/socket');
const notificationService = require('../services/notificationService');
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
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'active', 'done').required(),
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
    const task = await taskService.createTask(req.user.id, data);

    // Notify assignee (unless assigning to self)
    if (data.assigned_to !== req.user.id) {
        await notificationService.sendNotification(
            data.assigned_to,
            'task_assigned',
            `You have been assigned a new task: "${task.title}"`,
            task.id
        );
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
    }

    emitToUser(String(task.assigned_by), 'task:updated', task);

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
