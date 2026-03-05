const asyncWrapper = require('../utils/asyncWrapper');
const userModel = require('../models/userModel');
const taskModel = require('../models/taskModel');
const calendarModel = require('../models/calendarModel');
const notificationModel = require('../models/notificationModel');
const { AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    avatar_initials: Joi.string().max(2).optional(),
});

const validateBody = (schema, body) => {
    const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
    if (error) {
        const messages = error.details.map((d) => d.message.replace(/"/g, "'")).join('; ');
        throw { statusCode: 422, message: messages, status: 'fail' };
    }
    return value;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/dashboard
 * Returns aggregated stats for the authenticated user:
 * - total tasks, done count, delegated count, due-soon count (48 h)
 * - last 5 recent tasks
 * - next 3 upcoming calendar events
 * - unread notification count
 */
const getDashboard = asyncWrapper(async (req, res) => {
    const userId = req.user.id;

    // All tasks visible to user
    const allTasks = await taskModel.getTasksForUser(userId);
    const totalCount = allTasks.length;
    const doneCount = allTasks.filter((t) => t.status === 'done').length;
    const delegatedCount = allTasks.filter((t) => t.parent_task_id !== null).length;

    // Due-soon tasks (within 48 hours)
    const dueSoonTasks = await taskModel.getTasksDueSoon(userId, 48);
    const dueSoonCount = dueSoonTasks.length;

    // Recent 5 tasks (by created_at desc)
    const recentTasks = allTasks.slice(0, 5);

    // Upcoming 3 events
    const upcomingEvents = await calendarModel.getUpcomingEvents(userId, 3);

    // Unread notifications count
    const unreadNotifications = await notificationModel.getUnreadCount(userId);

    res.status(200).json({
        success: true,
        data: {
            stats: { totalCount, doneCount, delegatedCount, dueSoonCount },
            recentTasks,
            upcomingEvents,
            unreadNotifications,
        },
    });
});

// ─── User Profile ─────────────────────────────────────────────────────────────

/** GET /api/v1/users/me */
const getMe = asyncWrapper(async (req, res) => {
    const user = await userModel.getUserById(req.user.id);
    if (!user) throw new AppError('User not found.', 404);
    res.status(200).json({ success: true, data: user });
});

/** PATCH /api/v1/users/me */
const updateMe = asyncWrapper(async (req, res) => {
    const data = validateBody(updateProfileSchema, req.body);
    const user = await userModel.getUserById(req.user.id);

    if (data.name) {
        await userModel.updateUserProfile(req.user.id, {
            name: data.name,
            avatar_initials: data.avatar_initials || user.avatar_initials,
        });
    }

    const updated = await userModel.getUserById(req.user.id);
    res.status(200).json({ success: true, data: updated });
});

module.exports = { getDashboard, getMe, updateMe };
