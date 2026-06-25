/**
 * collegeRoutes.js — Routes for the TaskFlow (by Crevio) frontend.
 *
 * Mounted at: /api/college/v1/
 *
 * Frontend VITE_API_URL = https://taskflow-y0bo.onrender.com/api/college/v1
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const authRoutes         = require('./authRoutes');
const taskRoutes         = require('./taskRoutes');
const notesRoutes        = require('./notesRoutes');
const calendarRoutes     = require('./calendarRoutes');
const userRoutes         = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const teamRoutes         = require('./teamRoutes');
const friendRoutes       = require('./friendRoutes');   // ✅ was missing — fixed
const adminRoutes        = require('./adminRoutes');    // ✅ new admin panel
const feedbackRoutes     = require('./feedbackRoutes'); // ✅ user feedback
const chatRoutes         = require('./chatRoutes');
const billingRoutes      = require('./billingRoutes');
const nc                 = require('../controllers/collegeNotesController');

// Auth (login/register/refresh/google) — no auth middleware needed
router.use('/auth', authRoutes);

// Authenticated feature routes
router.use(authenticate);
router.use('/tasks',         taskRoutes);
router.use('/calendar',      calendarRoutes);
router.use('/notifications', notificationRoutes);
router.use('/team',          teamRoutes);
router.use('/friends',       friendRoutes);            // ✅ fixed: was missing entirely
router.use('/admin',         adminRoutes);             // ✅ admin panel
router.use('/feedback',      feedbackRoutes);          // ✅ user feedback
router.use('/chat',          chatRoutes);
router.use('/billing',       billingRoutes);

// ── Rich Notes (pages + blocks + sharing) ────────────────────────────────────
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

// Legacy flat notes
router.use('/notes', notesRoutes);
router.use('/',      userRoutes);

module.exports = router;
