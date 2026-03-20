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
            <title>TaskFlow API System</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                .bg-glow { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(15,23,42,0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; pointer-events: none; }
                .container { text-align: center; background: rgba(30, 41, 59, 0.7); padding: 3.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); backdrop-filter: blur(12px); max-width: 500px; width: 90%; }
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

module.exports = { app, server };
