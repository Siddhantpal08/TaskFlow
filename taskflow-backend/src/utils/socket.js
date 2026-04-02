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

        // Notes Collaboration Rooms
        socket.on('note:join', (pageId) => {
            if (pageId) socket.join(`note:${pageId}`);
        });

        socket.on('note:leave', (pageId) => {
            if (pageId) socket.leave(`note:${pageId}`);
        });

        // Forward a block update to other clients in the same note room
        socket.on('note:block:update', ({ pageId, blockId, changes }) => {
            socket.to(`note:${pageId}`).emit('note:block:updated', { blockId, changes });
        });

        socket.on('note:block:add', ({ pageId, block, afterIdx }) => {
            socket.to(`note:${pageId}`).emit('note:block:added', { block, afterIdx });
        });

        socket.on('note:block:delete', ({ pageId, idx }) => {
            socket.to(`note:${pageId}`).emit('note:block:deleted', { idx });
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
