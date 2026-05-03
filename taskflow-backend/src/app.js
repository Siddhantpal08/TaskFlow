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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TaskFlow — Backend Engine</title>
            <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%239D4EDD' /><stop offset='100%25' stop-color='%23FF6B6B' /></linearGradient></defs><rect width='100' height='100' rx='26' fill='url(%23g)'/><path d='M30 52 L45 67 L75 32' fill='none' stroke='white' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'/></svg>">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
                body { margin: 0; padding: 0; font-family: 'Space Grotesk', sans-serif; background: #0a0a0f; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                .bg-glow { position: absolute; width: 800px; height: 800px; background: radial-gradient(circle, rgba(157, 78, 221, 0.15) 0%, rgba(10, 10, 15, 0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; pointer-events: none; }
                .container { text-align: center; background: rgba(20, 20, 30, 0.6); padding: 4rem; border-radius: 32px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 30px 60px rgba(0,0,0,0.6); backdrop-filter: blur(20px); max-width: 550px; width: 90%; }
                .logo { width: 80px; height: 80px; margin-bottom: 1.5rem; filter: drop-shadow(0 10px 20px rgba(157, 78, 221, 0.4)); animation: float 6s ease-in-out infinite; }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                h1 { margin: 0 0 1rem 0; font-size: 3rem; font-weight: 700; background: linear-gradient(135deg, #FF6B6B, #9D4EDD); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }
                p { margin: 0 0 2.5rem 0; color: #a1a1aa; font-size: 1.1rem; line-height: 1.6; }
                .status-badge { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 999px; font-size: 0.95rem; color: #34d399; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2rem; }
                .status-dot { width: 10px; height: 10px; background: #34d399; border-radius: 50%; box-shadow: 0 0 12px #34d399; animation: pulse 2s infinite ease-in-out; }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
                .links { display: flex; justify-content: center; gap: 1.5rem; }
                .links a { color: #f8fafc; text-decoration: none; padding: 0.8rem 1.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 0.95rem; font-weight: 600; transition: all 0.2s; }
                .links a:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            </style>
        </head>
        <body>
            <div class="bg-glow"></div>
            <div class="container">
                <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#9D4EDD" />
                            <stop offset="100%" stop-color="#FF6B6B" />
                        </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="26" fill="url(#grad1)"/>
                    <path d="M30 52 L45 67 L75 32" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h1>TaskFlow Backend</h1>
                <p>Advanced Peer-to-Peer Collaborative Engine is heavily active and routing secure requests globally.</p>
                <div class="status-badge">
                    <div class="status-dot"></div>
                    System Operational
                </div>
                <div class="links">
                    <a href="/health">Health Diagnostic</a>
                </div>
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
