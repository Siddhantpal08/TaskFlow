/**
 * collegeRoutes.js — Routes for the College Project submission frontend.
 *
 * Mounted at: /api/college/v1/
 *
 * Includes: auth, tasks, rich notes tree (pages/blocks/share),
 *           calendar, notifications, team, profile.
 *
 * The College Project Vercel frontend uses:
 *   VITE_API_URL = https://taskflow-y0bo.onrender.com/api/college/v1
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const authRoutes         = require('./authRoutes');
const taskRoutes         = require('./taskRoutes');
const notesRoutes        = require('./notesRoutes');      // legacy flat notes (kept for compat)
const calendarRoutes     = require('./calendarRoutes');
const userRoutes         = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const teamRoutes         = require('./teamRoutes');
const nc                 = require('../controllers/collegeNotesController');

// Auth (login/register/refresh/google) — no auth middleware needed (handled inside)
router.use('/auth', authRoutes);

// Authenticated feature routes
router.use(authenticate);
router.use('/tasks',         taskRoutes);
router.use('/calendar',      calendarRoutes);
router.use('/notifications', notificationRoutes);
router.use('/team',          teamRoutes);

// ── Rich Notes (pages + blocks + sharing) ──────────────────────────────────
// These shadow the legacy flat /notes routes with the full block-based system.
router.get('/notes/pages',                    nc.getPages);
router.post('/notes/pages',                   nc.createPage);
router.get('/notes/pages/:id',                nc.getPage);
router.put('/notes/pages/:id',                nc.updatePage);
router.delete('/notes/pages/:id',             nc.deletePage);
router.post('/notes/pages/:id/duplicate',     nc.duplicatePage);
router.patch('/notes/pages/:id/reorder',      nc.reorderPages);
router.patch('/notes/pages/:id/mode',         nc.setWritingMode);
router.post('/notes/pages/:id/share',         nc.sharePage);
router.post('/notes/accept-share/:token',     nc.acceptShare);
router.post('/notes/pages/:pageId/blocks',    nc.createBlock);
router.put('/notes/blocks/:blockId',          nc.updateBlock);
router.delete('/notes/blocks/:blockId',       nc.deleteBlock);

// Legacy flat notes (kept in case old clients use them)
router.use('/notes',         notesRoutes);

router.use('/',              userRoutes);         // /users/me, /dashboard

module.exports = router;
