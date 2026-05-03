require('dotenv').config();
const { app } = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
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
