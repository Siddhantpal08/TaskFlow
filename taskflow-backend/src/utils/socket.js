/**
 * Socket.IO singleton utility.
 * Call `initSocket(io)` once from server.js, then use `emitToUser` anywhere.
 */

let _io = null;

/**
 * Initialize the Socket.IO instance and set up connection handling.
 * @param {import('socket.io').Server} io
 */
const initSocket = (io) => {
    _io = io;

    io.on('connection', (socket) => {
        const userId = socket.handshake.auth?.userId;

        if (!userId) {
            socket.disconnect(true);
            return;
        }

        const roomId = `user:${userId}`;
        socket.join(roomId);

        // Update online status in DB
        const db = require('./db');
        db.query('UPDATE users SET is_online = 1 WHERE id = ?', [userId]).catch(console.error);

        // Broadcast online presence to all connected clients
        io.emit('user:online', { userId });

        socket.on('disconnect', () => {
            db.query('UPDATE users SET is_online = 0 WHERE id = ?', [userId]).catch(console.error);
            io.emit('user:offline', { userId });
        });
    });
};

/**
 * Emit an event to a specific user's room.
 * @param {string} userId
 * @param {string} event
 * @param {any} data
 */
const emitToUser = (userId, event, data) => {
    if (!_io) return;
    _io.to(`user:${userId}`).emit(event, data);
};

/**
 * Get the raw io instance (for advanced use).
 */
const getIo = () => _io;

module.exports = { initSocket, emitToUser, getIo };
