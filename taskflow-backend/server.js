require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { app } = require('./src/app');

const PORT = process.env.PORT || 5000;

// ─── Allowed Origins (same as app.js) ────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:19006',
        'https://taskflow.siddhantpal.me',
    ];

const isLanOrigin = (origin) => {
    if (!origin) return false;
    return /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin);
};

// ─── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                origin.startsWith('http://localhost') ||
                origin.startsWith('http://127.0.0.1') ||
                origin.endsWith('.vercel.app') ||
                isLanOrigin(origin)
            ) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
});

// Store io globally so notificationService + socket utils can access it
global._io = io;

const onlineSet = new Set();
global._onlineUsers = onlineSet;

io.on('connection', (socket) => {
    // Accept userId from auth (primary) or query (fallback for reconnects)
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    if (userId) {
        socket.join(`user_${userId}`);
        onlineSet.add(String(userId));
        io.emit('user:online', { userId });
        
        // Send current online users to the newly connected user
        socket.emit('users:online_list', { onlineUsers: Array.from(onlineSet) });
        
        console.log(`[Socket] User ${userId} connected — socket ${socket.id}`);
    }

    // Allow clients to explicitly re-join their room after reconnection
    socket.on('join', ({ userId: uid }) => {
        if (uid) {
            socket.join(`user_${uid}`);
            onlineSet.add(String(uid));
            io.emit('user:online', { userId: uid });
            socket.emit('users:online_list', { onlineUsers: Array.from(onlineSet) });
            console.log(`[Socket] User ${uid} re-joined room — socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Socket ${socket.id} disconnected`);
        if (userId) {
            // Only mark offline if this was their last socket
            const allSockets = [...io.sockets.sockets.values()];
            const stillOnline = allSockets.some(s => 
                s.id !== socket.id && (s.handshake.auth?.userId == userId || s.handshake.query?.userId == userId)
            );
            if (!stillOnline) {
                onlineSet.delete(String(userId));
                io.emit('user:offline', { userId });
            }
        }
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`[TaskFlow] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = () => {
    console.log('[TaskFlow] Shutting down gracefully...');
    server.close(() => {
        console.log('[TaskFlow] HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
