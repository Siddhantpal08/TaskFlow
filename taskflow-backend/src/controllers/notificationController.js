const asyncWrapper = require('../utils/asyncWrapper');
const notificationModel = require('../models/notificationModel');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/notifications
 * Optional query: ?since=<ISO timestamp> for reconnect catch-up (NOTIF edge case).
 */
const listNotifications = asyncWrapper(async (req, res) => {
    const since = req.query.since || null;
    const notifications = await notificationModel.getNotificationsForUser(req.user.id, since);
    const unreadCount = await notificationModel.getUnreadCount(req.user.id);

    res.status(200).json({
        success: true,
        data: { notifications, unreadCount },
    });
});

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read and return 0 unread count.
 */
const markAllRead = asyncWrapper(async (req, res) => {
    await notificationModel.markAllRead(req.user.id);
    res.status(200).json({ success: true, message: 'All notifications marked as read.', unreadCount: 0 });
});

/**
 * PATCH /api/v1/notifications/:id/read
 */
const markOneRead = asyncWrapper(async (req, res) => {
    const updated = await notificationModel.markOneRead(parseInt(req.params.id, 10), req.user.id);
    if (!updated) throw new AppError('Notification not found.', 404);
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
});

module.exports = { listNotifications, markAllRead, markOneRead };
