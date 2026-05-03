const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { sanitizeBlock } = require('./middleware/sanitize');
const { startReminderJob } = require('./utils/eventReminderJob');

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notesRoutes = require('./routes/notesRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const teamRoutes = require('./routes/teamRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1); // Required when behind a reverse proxy (e.g. Render)

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:19006',
        'https://taskflow-by-crevio.vercel.app',
    ];

const isLanOrigin = (origin) => {
    if (!origin) return false;
    return /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin);
};

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.endsWith('.vercel.app') ||
            isLanOrigin(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} not allowed.`));
        }
    },
    credentials: true,
}));

// ─── Security & Parsing Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── XSS Sanitization ─────────────────────────────────────────────────────────
app.use(sanitizeBlock);

// ─── Root Page ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>TaskFlow — Backend API</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
                body { margin: 0; font-family: 'Space Grotesk', sans-serif; background: #0a0a0f; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; }
                .card { text-align: center; background: rgba(20,20,30,0.7); padding: 3rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); max-width: 480px; }
                h1 { font-size: 2.5rem; background: linear-gradient(135deg,#9D4EDD,#FF6B6B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 0.5rem; }
                p { color: #a1a1aa; margin-bottom: 1.5rem; }
                .badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 999px; color: #34d399; font-weight: 600; font-size: 0.9rem; }
                .dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>TaskFlow API</h1>
                <p>Peer-to-Peer Task Management — Backend Engine</p>
                <div class="badge"><div class="dot"></div> System Operational</div>
            </div>
        </body>
        </html>
    `);
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'TaskFlow API is running.' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1', userRoutes);  // /api/v1/users/me, /api/v1/dashboard

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ status: 'fail', message: `API route not found: ${req.method} ${req.originalUrl}` });
    }
    res.status(404).send('<h1>404 — Not Found</h1>');
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Reminder Cron Job ──────────────────────────────────────────────────
startReminderJob();

module.exports = { app };
