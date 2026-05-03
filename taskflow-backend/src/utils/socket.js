/**
 * socket.js — Socket.IO helper utility.
 *
 * Provides a simple `emitToUser(userId, event, data)` function
 * that other modules can call without needing direct access to the
 * Socket.IO instance.
 *
 * The Socket.IO instance is stored on `global._io` when the server
 * initializes it (see server.js).
 */

/**
 * Emit a Socket.IO event to a specific user's room.
 *
 * @param {string} userId - The user ID (as a string) to emit to
 * @param {string} event  - The event name (e.g. 'task:assigned')
 * @param {*}      data   - Any JSON-serializable payload
 */
const emitToUser = (userId, event, data) => {
    try {
        if (global._io) {
            global._io.to(`user_${userId}`).emit(event, data);
        }
    } catch (err) {
        // Socket failures must never crash request handlers
        console.error(`[Socket] Failed to emit "${event}" to user ${userId}:`, err.message);
    }
};

module.exports = { emitToUser };
