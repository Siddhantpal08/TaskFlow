/**
 * collegeRoutes.js — Routes exclusive to the College Project frontend.
 *
 * Mounted at: /api/college/v1/
 *
 * Includes:
 *  - /friends   — Friend system (send/accept/remove requests)
 *  - /notes     — Rich notes (pages + blocks + share + duplicate + writing mode)
 *
 * The standard /api/v1/ routes remain unchanged for taskflow-web/mobile,
 * which only get simple notes (CRUD) and no friends system.
 */
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const friendController = require('../controllers/friendController');
const nc = require('../controllers/collegeNotesController');

// All college routes require auth
router.use(authenticate);

// ─── Friends ─────────────────────────────────────────────────────────────────
router.get('/friends', friendController.getFriendsAndRequests);
router.post('/friends/request', friendController.sendRequest);
router.post('/friends/accept', friendController.acceptRequest);
router.delete('/friends/:friendshipId', friendController.removeFriend);

// ─── Rich Notes — Pages ───────────────────────────────────────────────────────
router.get('/notes/pages', nc.getPages);
router.post('/notes/pages', nc.createPage);
router.get('/notes/pages/:id', nc.getPage);
router.put('/notes/pages/:id', nc.updatePage);
router.delete('/notes/pages/:id', nc.deletePage);
router.post('/notes/pages/:id/duplicate', nc.duplicatePage);
router.patch('/notes/pages/:id/reorder', nc.reorderPages);
router.patch('/notes/pages/:id/mode', nc.setWritingMode);
router.post('/notes/pages/:id/share', nc.sharePage);
router.post('/notes/accept-share/:token', nc.acceptShare);

// ─── Rich Notes — Blocks ──────────────────────────────────────────────────────
router.post('/notes/pages/:pageId/blocks', nc.createBlock);
router.put('/notes/blocks/:blockId', nc.updateBlock);
router.delete('/notes/blocks/:blockId', nc.deleteBlock);

module.exports = router;
