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
            <title>TaskFlow API System</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                .bg-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(15,23,42,0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; pointer-events: none; }
                .container { text-align: center; background: rgba(30, 41, 59, 0.7); padding: 3.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); backdrop-filter: blur(12px); max-width: 500px; width: 90%; }
                .logo { width: 72px; height: 72px; margin-bottom: 1.5rem; filter: drop-shadow(0 0 18px rgba(56,189,248,0.5)); animation: float 4s ease-in-out infinite; display: inline-block; }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-12px); } 100% { transform: translateY(0px); } }
                h1 { margin: 0 0 1rem 0; font-size: 3.5rem; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.05em; }
                p { margin: 0 0 2rem 0; color: #94a3b8; font-size: 1.15rem; line-height: 1.6; }
                .status-badge { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.5rem 1.25rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 999px; font-size: 0.9rem; color: #34d399; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .status-dot { width: 10px; height: 10px; background: #34d399; border-radius: 50%; box-shadow: 0 0 12px #34d399; animation: pulse 2s infinite ease-in-out; }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); box-shadow: 0 0 4px #34d399; } 100% { opacity: 1; transform: scale(1); } }
                .links { margin-top: 2rem; display: flex; justify-content: center; gap: 1rem; }
                .links a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; border-bottom: 1px dashed transparent; }
                .links a:hover { color: #38bdf8; border-bottom-color: #38bdf8; }
            </style>
        </head>
        <body>
            <div class="bg-glow"></div>
            <div class="container">
                <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#38bdf8" />
                            <stop offset="100%" stop-color="#818cf8" />
                        </linearGradient>
                    </defs>
                    <rect width="100" height="100" rx="26" fill="url(#g)"/>
                    <path d="M30 52 L45 67 L75 32" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h1>TaskFlow Backend</h1>
                <p>The core API service powering TaskFlow applications is active and routing requests securely.</p>
                <div class="status-badge">
                    <div class="status-dot"></div>
                    System Operational
                </div>
                <div class="links">
                    <a href="/health">Health Check</a>
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
