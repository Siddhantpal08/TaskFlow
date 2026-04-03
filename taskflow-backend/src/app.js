const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { initSocket } = require('./utils/socket');
const { startReminderJob } = require('./utils/eventReminderJob');

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notesRoutes = require('./routes/notesRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const teamRoutes = require('./routes/teamRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1); // Required for express-rate-limit when behind Render's reverse proxy

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:19006',
        'https://taskflow-by-crevio.vercel.app',   // production frontend
    ];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, Postman)
        if (!origin) return callback(null, true);

        // Looping origin logic or regex can be used, but for dev and Vercel previews:
        if (
            allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            console.warn(`[CORS REJECT] Origin ${origin} not in allowed origins.`);
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

// ─── Rate Limiting (general, on all API routes) ───────────────────────────────
app.use('/api/', generalLimiter);

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

// ─── Diagnostic Hook ──────────────────────────────────────────────────────────
app.get('/db-repair', async (req, res) => {
    try {
        const db = require('./utils/db');

        const q1 = await db.query(`CREATE TABLE IF NOT EXISTS notes_pages (
            id CHAR(36) PRIMARY KEY,
            user_id INT NOT NULL,
            parent_id CHAR(36) NULL,
            title VARCHAR(255) DEFAULT 'Untitled',
            emoji VARCHAR(8) NULL,
            position INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES notes_pages(id) ON DELETE CASCADE
        )`).catch(e => e.message);

        const q2 = await db.query(`CREATE TABLE IF NOT EXISTS notes_blocks (
            id CHAR(36) PRIMARY KEY,
            page_id CHAR(36) NOT NULL,
            type VARCHAR(20) DEFAULT 'p',
            content TEXT,
            checked TINYINT(1) DEFAULT 0,
            position INT DEFAULT 0,
            FOREIGN KEY (page_id) REFERENCES notes_pages(id) ON DELETE CASCADE
        )`).catch(e => e.message);

        const r1 = await db.query("ALTER TABLE users ADD COLUMN role ENUM('admin','user') DEFAULT 'user'").catch(e => e.message);
        const r2 = await db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL').catch(e => e.message);
        const r3 = await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL').catch(e => e.message);
        const r4 = await db.query('ALTER TABLE users ADD COLUMN bio TEXT NULL').catch(e => e.message);

        res.json({ tables: { q1, q2 }, alter: { r1, r2, r3, r4 } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Diagnostic Hook ──────────────────────────────────────────────────────────
app.get('/api/v1/diagnose-db', async (req, res) => {
    try {
        const db = require('./utils/db');
        const errors = [];
        const success = [];

        try { await db.query('ALTER TABLE users ADD COLUMN role ENUM("admin","user") DEFAULT "user"'); success.push("role"); } catch (e) { errors.push({ col: "role", err: e.message }); }
        try { await db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL'); success.push("google_id"); } catch (e) { errors.push({ col: "google_id", err: e.message }); }
        try { await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL'); success.push("avatar_url"); } catch (e) { errors.push({ col: "avatar_url", err: e.message }); }
        try { await db.query('ALTER TABLE users ADD COLUMN bio TEXT NULL'); success.push("bio"); } catch (e) { errors.push({ col: "bio", err: e.message }); }

        res.json({ success, errors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1', userRoutes);          // /api/v1/dashboard, /api/v1/users/me

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    // If it's an API route, always return JSON
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ status: 'fail', message: `API route not found: ${req.method} ${req.originalUrl}` });
    }

    // Otherwise, return a nice HTML 404 fallback page
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - TaskFlow</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                .container { text-align: center; background: rgba(30, 41, 59, 0.7); padding: 3.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); backdrop-filter: blur(12px); max-width: 500px; width: 90%; position: relative; }
                h1 { margin: 0 0 0.5rem 0; font-size: 6rem; font-weight: 800; background: linear-gradient(135deg, #f87171, #f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                h2 { margin: 0 0 1.5rem 0; font-size: 1.5rem; color: #e2e8f0; font-weight: 600; }
                p { margin: 0 0 2.5rem 0; color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }
                .route-name { background: rgba(0,0,0,0.3); padding: 0.2rem 0.6rem; border-radius: 6px; font-family: monospace; font-size: 0.95rem; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); }
                a { display: inline-flex; align-items: center; justify-content: center; color: #f8fafc; text-decoration: none; padding: 0.75rem 1.75rem; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 12px; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39); }
                a:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.23); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <h2>Endpoint Not Found</h2>
                <p>The path <span class="route-name">${req.originalUrl}</span> could not be located on this server.</p>
                <a href="/">Return to System Home</a>
            </div>
        </body>
        </html>
    `);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

initSocket(io);

// Start background cron jobs
startReminderJob();

module.exports = { app, server };
