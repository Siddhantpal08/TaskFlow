const taskModel = require('../models/taskModel');
const { AppError } = require('../middleware/errorHandler');

// Helper to format JavaScript Date or ISO string to MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
function formatToMySQLDate(dateInput) {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// ─── Create Task ──────────────────────────────────────────────────────────────

const createTask = async (creatorId, data) => {
    // Ensure due_date is in MySQL DATETIME format if provided
    if (data.due_date) {
        data.due_date = formatToMySQLDate(data.due_date);
    }
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
        // Format due_date if a new value is provided
        due_date: fields.due_date ? formatToMySQLDate(fields.due_date) : task.due_date,
        assigned_to: fields.assigned_to ?? task.assigned_to,
    });

    return taskModel.getTaskById(taskId);
};

// ─── Update Status ────────────────────────────────────────────────────────────

/**
 * Only the assignee can change status.
 * Cannot mark Done if any active sub-task (delegated) is not yet Done.
 * Transition: pending → active → pending_approval → done.
 */
const updateStatus = async (taskId, userId, newStatus) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Only the creator or the assignee can change status
    if (task.assigned_to !== userId && task.assigned_by !== userId) {
        throw new AppError('Only the task creator or assignee can update task status.', 403);
    }

    let finalStatus = newStatus;

    // If assignee marks as done, but they are not the assigner, it requires approval
    if (newStatus === 'done' && task.assigned_by !== userId && task.assigned_to === userId) {
        finalStatus = 'pending_approval';
    }

    // Enforce linear status transitions
    const transitions = {
        pending: ['active', 'refused'],
        active: ['done', 'pending', 'pending_approval', 'refused'],
        pending_approval: ['done', 'active'], // Assigner can approve to 'done' or reject to 'active'
        done: ['active'], // Assigner might want to reopen
        refused: ['active', 'pending', 'done'] // Assigner can reassign/reopen
    };
    if (!transitions[task.status]?.includes(finalStatus)) {
        throw new AppError(`Cannot transition from '${task.status}' to '${finalStatus}'.`, 409);
    }

    // Block marking Done or pending_approval if pending sub-tasks exist
    if (finalStatus === 'done' || finalStatus === 'pending_approval') {
        const subTasks = await taskModel.getSubTasks(taskId);
        const blocking = subTasks.filter((s) => s.status !== 'done');
        if (blocking.length > 0) {
            const titles = blocking.map((s) => `"${s.title}"`).join(', ');
            throw new AppError(
                `Cannot mark as completion. Blocking sub-tasks: ${titles}`,
                409
            );
        }
    }

    await taskModel.updateStatus(taskId, finalStatus);
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

    // Cannot delegate a completed or refused task
    if (task.status === 'done' || task.status === 'refused') {
        throw new AppError(`Cannot delegate a ${task.status} task.`, 409);
    }

    const childTaskId = await taskModel.delegateTask(taskId, newAssigneeId, taskId);
    return taskModel.getTaskById(childTaskId);
};

// ─── Delete Task ──────────────────────────────────────────────────────────────

const deleteTask = async (taskId, userId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);

    // Creator can delete, anyone can delete if task is done
    // Also we will allow team admins to delete, but for simplicity, we'll allow assignee to delete done tasks
    if (task.assigned_by !== userId && task.status !== 'done') {
        throw new AppError('Only the task creator can delete this task unless it is completed.', 403);
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
