const notificationModel = require('../models/notificationModel');
const { emitToUser } = require('../utils/socket');

/**
 * Create a notification in DB and emit it via Socket.IO in real-time.
 * @param {number} userId - Recipient user ID
 * @param {string} type - Notification type (task_assigned, task_delegated, status_update, event_created, due_soon)
 * @param {string} message - Human-readable message
 * @param {number|null} refId - Reference ID (task.id or event.id)
 */
const sendNotification = async (userId, type, message, refId = null) => {
    const notification = await notificationModel.createNotification(userId, type, message, refId);

    // Real-time delivery via Socket.IO
    emitToUser(String(userId), 'notification:new', notification);

    return notification;
};

module.exports = { sendNotification };
