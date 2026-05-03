/**
 * collegeRoutes.js — BASIC routes for the College Project submission frontend.
 *
 * Mounted at: /api/college/v1/
 *
 * Intentionally simple — auth, tasks, simple notes (flat CRUD), calendar.
 * NO friends, NO rich notes tree, NO teams hierarchy.
 *
 * The College Project Vercel frontend uses:
 *   VITE_API_URL = https://taskflow-y0bo.onrender.com/api/college/v1
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const authRoutes      = require('./authRoutes');
const taskRoutes      = require('./taskRoutes');
const notesRoutes     = require('./notesRoutes');      // simple flat notes
const calendarRoutes  = require('./calendarRoutes');
const userRoutes      = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const teamRoutes      = require('./teamRoutes');

// Auth (login/register/refresh/google) — no auth middleware needed (handled inside)
router.use('/auth', authRoutes);

// Authenticated basic feature routes
router.use(authenticate);
router.use('/tasks',         taskRoutes);
router.use('/notes',         notesRoutes);       // flat notes: GET /notes, POST /notes, etc.
router.use('/calendar',      calendarRoutes);
router.use('/notifications', notificationRoutes);
router.use('/team',          teamRoutes);
router.use('/',              userRoutes);         // /users/me, /dashboard

module.exports = router;
