const taskModel = require('../models/taskModel');
const { AppError } = require('../middleware/errorHandler');

// ─── Create Task ──────────────────────────────────────────────────────────────

const createTask = async (creatorId, data) => {
    const taskId = await taskModel.createTask({
        ...data,
        assigned_by: creatorId,
    });
    return taskModel.getTaskById(taskId);
};

// ─── Get Task (with ownership check) ─────────────────────────────────────────

const getTask = async (taskId, requestingUserId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // A user can see a task if they created or are assigned to it
    if (task.assigned_by !== requestingUserId && task.assigned_to !== requestingUserId) {
        throw new AppError('You do not have permission to view this task.', 403);
    }
    return task;
};

// ─── Update Task ──────────────────────────────────────────────────────────────

const updateTask = async (taskId, userId, fields) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Only the creator can update task details
    if (task.assigned_by !== userId) {
        throw new AppError('Only the task creator can update task details.', 403);
    }

    await taskModel.updateTask(taskId, {
        title: fields.title ?? task.title,
        description: fields.description ?? task.description,
        priority: fields.priority ?? task.priority,
        due_date: fields.due_date ?? task.due_date,
    });

    return taskModel.getTaskById(taskId);
};

// ─── Update Status ────────────────────────────────────────────────────────────

/**
 * Only the assignee can change status.
 * Cannot mark Done if any active sub-task (delegated) is not yet Done.
 * Transition: pending → active → done (strict order enforced).
 */
const updateStatus = async (taskId, userId, newStatus) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Only assignee can change status
    if (task.assigned_to !== userId) {
        throw new AppError('Only the assigned user can update task status.', 403);
    }

    // Enforce linear status transitions
    const transitions = { pending: ['active'], active: ['done', 'pending'], done: [] };
    if (!transitions[task.status]?.includes(newStatus)) {
        throw new AppError(`Cannot transition from '${task.status}' to '${newStatus}'.`, 409);
    }

    // Block marking Done if pending sub-tasks exist
    if (newStatus === 'done') {
        const subTasks = await taskModel.getSubTasks(taskId);
        const blocking = subTasks.filter((s) => s.status !== 'done');
        if (blocking.length > 0) {
            const titles = blocking.map((s) => `"${s.title}"`).join(', ');
            throw new AppError(
                `Cannot mark as done. Blocking sub-tasks: ${titles}`,
                409
            );
        }
    }

    await taskModel.updateStatus(taskId, newStatus);
    return taskModel.getTaskById(taskId);
};

// ─── Delegate Task ────────────────────────────────────────────────────────────

/**
 * The current assignee delegates the task to someone else.
 * Creates a new child task linked via parent_task_id.
 */
const delegateTask = async (taskId, delegatorId, newAssigneeId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Only the current assignee can delegate
    if (task.assigned_to !== delegatorId) {
        throw new AppError('Only the current assignee can delegate this task.', 403);
    }

    // Cannot delegate to yourself
    if (newAssigneeId === delegatorId) {
        throw new AppError('Cannot delegate a task to yourself.', 400);
    }

    // Cannot delegate a completed task
    if (task.status === 'done') {
        throw new AppError('Cannot delegate a completed task.', 409);
    }

    const childTaskId = await taskModel.delegateTask(taskId, newAssigneeId, taskId);
    return taskModel.getTaskById(childTaskId);
};

// ─── Delete Task ──────────────────────────────────────────────────────────────

const deleteTask = async (taskId, userId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Only creator can delete
    if (task.assigned_by !== userId) {
        throw new AppError('Only the task creator can delete this task.', 403);
    }

    await taskModel.deleteTask(taskId);
};

// ─── Bulk Delete ──────────────────────────────────────────────────────────────

const bulkDeleteTasks = async (ids, userId) => {
    return taskModel.bulkDeleteTasks(ids, userId);
};

module.exports = {
    createTask,
    getTask,
    updateTask,
    updateStatus,
    delegateTask,
    deleteTask,
    bulkDeleteTasks,
};
