/**
 * taskService.js — Business logic layer for task operations.
 *
 * Sits between taskController (HTTP layer) and taskModel (data layer),
 * handling authorization checks, validation, and composing model calls.
 */

const taskModel = require('../models/taskModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create a new task and return the full enriched task record.
 * @param {number} creatorId - ID of the user creating the task
 * @param {object} data - { title, description, priority, assigned_to, due_date }
 */
const createTask = async (creatorId, data) => {
    const id = await taskModel.createTask({
        ...data,
        assigned_by: creatorId,
    });
    const task = await taskModel.getTaskById(id);
    if (!task) throw new AppError('Failed to retrieve created task.', 500);
    return task;
};

/**
 * Get a single task, verifying the requester is authorized to view it.
 * @param {number} taskId
 * @param {number} userId
 */
const getTask = async (taskId, userId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    if (task.assigned_by !== userId && task.assigned_to !== userId) {
        throw new AppError('You are not authorized to view this task.', 403);
    }
    return task;
};

/**
 * Update a task. Only the creator (assigned_by) can edit details.
 * @param {number} taskId
 * @param {number} userId
 * @param {object} data - fields to update
 */
const updateTask = async (taskId, userId, data) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    if (task.assigned_by !== userId) {
        throw new AppError('Only the task creator can update this task.', 403);
    }

    // Merge existing fields with update data
    const updated = {
        title:       data.title       ?? task.title,
        description: data.description ?? task.description,
        priority:    data.priority    ?? task.priority,
        due_date:    data.due_date    ?? task.due_date,
        assigned_to: data.assigned_to ?? task.assigned_to,
    };

    await taskModel.updateTask(taskId, updated);
    return await taskModel.getTaskById(taskId);
};

/**
 * Update the status of a task.
 * - Assignee can set: active, pending_approval, refused
 * - Creator can set: done (approve) or active (reject pending_approval)
 * @param {number} taskId
 * @param {number} userId
 * @param {string} status
 */
const updateStatus = async (taskId, userId, status) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    if (task.assigned_by !== userId && task.assigned_to !== userId) {
        throw new AppError('You are not authorized to update this task.', 403);
    }
    await taskModel.updateStatus(taskId, status);
    return await taskModel.getTaskById(taskId);
};

/**
 * Delegate (sub-assign) a task to a new user, creating a linked child task.
 * @param {number} taskId - parent task ID
 * @param {number} userId - current assignee doing the delegation
 * @param {number} newAssigneeId - user to delegate to
 */
const delegateTask = async (taskId, userId, newAssigneeId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    if (task.assigned_to !== userId) {
        throw new AppError('Only the current assignee can delegate this task.', 403);
    }
    if (newAssigneeId === userId) {
        throw new AppError('You cannot delegate a task to yourself.', 400);
    }

    const childTaskId = await taskModel.delegateTask(taskId, newAssigneeId, taskId);
    if (!childTaskId) throw new AppError('Delegation failed. Parent task not found.', 500);
    return await taskModel.getTaskById(childTaskId);
};

/**
 * Delete a task. Only the creator can delete.
 * @param {number} taskId
 * @param {number} userId
 */
const deleteTask = async (taskId, userId) => {
    const task = await taskModel.getTaskById(taskId);
    if (!task) throw new AppError('Task not found.', 404);
    if (task.assigned_by !== userId) {
        throw new AppError('Only the task creator can delete this task.', 403);
    }
    await taskModel.deleteTask(taskId);
};

/**
 * Bulk delete tasks — skips tasks the user didn't create.
 * @param {number[]} ids
 * @param {number} userId
 */
const bulkDeleteTasks = async (ids, userId) => {
    return await taskModel.bulkDeleteTasks(ids, userId);
};

module.exports = { createTask, getTask, updateTask, updateStatus, delegateTask, deleteTask, bulkDeleteTasks };
