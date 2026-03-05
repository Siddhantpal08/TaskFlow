const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
    getPageTree, createPage, getPage, updatePage, deletePage, reorderChildren,
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
router.patch('/pages/:id/reorder', reorderChildren);
router.post('/pages/:id/blocks', createBlock);

// Block routes
router.put('/blocks/:id', updateBlock);
router.delete('/blocks/:id', deleteBlock);

module.exports = router;
