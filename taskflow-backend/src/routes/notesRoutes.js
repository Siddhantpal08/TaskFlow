const express = require('express');
const { authenticate } = require('../middleware/auth');
const { notesLimiter } = require('../middleware/rateLimiter');
const { sanitizeBlock } = require('../middleware/sanitize');
const {
    getPageTree, createPage, getPage, updatePage, deletePage, duplicatePage, reorderChildren,
    createBlock, updateBlock, deleteBlock,
} = require('../controllers/notesController');

const router = express.Router();

router.use(authenticate);

// Page routes
router.get('/pages', getPageTree);
router.post('/pages', createPage);
router.get('/pages/:id', getPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);
router.post('/pages/:id/duplicate', duplicatePage);
router.patch('/pages/:id/reorder', reorderChildren);

// Block write routes — rate-limited + sanitized
router.post('/pages/:id/blocks', notesLimiter, sanitizeBlock, createBlock);
router.put('/blocks/:id', notesLimiter, sanitizeBlock, updateBlock);
router.delete('/blocks/:id', deleteBlock);

module.exports = router;
