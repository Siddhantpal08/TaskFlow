/**
 * notificationService.js — Service layer for creating and broadcasting notifications.
 *
 * Wraps the notificationModel and can optionally emit real-time
 * Socket.IO events if a socket server is attached.
 *
 * Usage:
 *   const { sendNotification } = require('../services/notificationService');
 *   await sendNotification(userId, 'task_assigned', 'You have a new task', taskId);
 */

const notificationModel = require('../models/notificationModel');

/**
 * Create a notification for a user and (optionally) emit it via Socket.IO.
 *
 * @param {number} userId  - Recipient user ID
 * @param {string} type    - Notification type key (e.g. 'task_assigned', 'event_reminder')
 * @param {string} message - Human-readable message string
 * @param {number|null} refId - Optional reference ID (task ID, event ID, etc.)
 * @returns {Promise<object>} The created notification record
 */
const sendNotification = async (userId, type, message, refId = null) => {
    const notif = await notificationModel.createNotification(userId, type, message, refId);

    // If Socket.IO is configured, emit to the user's room
    // The socket instance is attached to the global app if available
    try {
        if (global._io) {
            global._io.to(`user_${userId}`).emit('notification:new', notif);
        }
    } catch (_) {
        // Socket emission failures should never crash the cron job
    }

    return notif;
};

module.exports = { sendNotification };
