const notesModel = require('../models/notesModel');
const { AppError } = require('../middleware/errorHandler');

// ─── Pages ────────────────────────────────────────────────────────────────────

/**
 * Build a nested tree from the flat list returned by getPageTree.
 */
const buildTree = (pages) => {
    const map = {};
    const roots = [];

    for (const page of pages) {
        map[page.id] = { ...page, children: [] };
    }

    for (const page of pages) {
        if (page.parent_id && map[page.parent_id]) {
            map[page.parent_id].children.push(map[page.id]);
        } else {
            roots.push(map[page.id]);
        }
    }

    return roots;
};

const getPageTree = async (userId) => {
    const pages = await notesModel.getPageTree(userId);
    return buildTree(pages);
};

const createPage = async (userId, data) => {
    if (data.parentId) {
        const parent = await notesModel.getPageById(data.parentId, userId);
        if (!parent || parent.user_id !== userId) throw new AppError('Parent page not found or not owned by you.', 403);
    }
    return notesModel.createPage(userId, data);
};

const getPage = async (pageId, userId) => {
    const page = await notesModel.getPageWithBlocks(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    return page;
};

const updatePage = async (pageId, userId, data) => {
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);

    return notesModel.updatePage(pageId, userId, {
        title: data.title ?? page.title,
        emoji: data.emoji !== undefined ? data.emoji : page.emoji,
        position: data.position !== undefined ? data.position : page.position,
    });
};

const setWritingMode = async (pageId, userId, mode) => {
    if (pageId === 'root') return;
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    if (page.user_id !== userId) throw new AppError('Only the owner can change the writing mode.', 403);
    await notesModel.setWritingMode(pageId, userId, mode || null);
};

const deletePage = async (pageId, userId) => {
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    if (page.user_id !== userId) throw new AppError('Only the owner can delete this page.', 403);

    const count = await notesModel.deletePageRecursive(pageId, userId);
    return { deletedCount: count };
};

const duplicatePage = async (pageId, userId) => {
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    if (page.user_id !== userId) throw new AppError('Only the owner can duplicate this page.', 403);

    return notesModel.duplicatePageRecursive(pageId, userId, true);
};

const reorderChildren = async (parentId, userId, orderedIds) => {
    const checks = orderedIds.map((id) => notesModel.getPageById(id, userId));
    const pages = await Promise.all(checks);
    const invalid = pages.filter((p) => !p || p.user_id !== userId);
    if (invalid.length > 0) {
        throw new AppError('One or more page IDs not found or not owned by you.', 403);
    }

    await notesModel.reorderChildren(parentId, userId, orderedIds);
};

// ─── Note Sharing ─────────────────────────────────────────────────────────────

/**
 * Generate a share link token. Owner must own the page.
 * Returns { shareUrl, token, pageTitle, pageEmoji }
 */
const shareNote = async (pageId, userId) => {
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    if (page.user_id !== userId) throw new AppError('Only the owner can share this page.', 403);

    // Count descendants
    const allIds = [pageId];
    const queue = [pageId];
    while (queue.length) {
        const cur = queue.shift();
        const [children] = await require('../utils/db').query(
            `SELECT id FROM notes_pages WHERE parent_id = ? AND user_id = ?`, [cur, userId]
        );
        for (const c of children) { allIds.push(c.id); queue.push(c.id); }
    }

    const token = await notesModel.createShareToken(pageId, userId);
    const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${APP_URL}?accept-share=${token}`;

    return {
        shareUrl,
        token,
        pageTitle: page.title,
        pageEmoji: page.emoji || '📄',
        subNoteCount: allIds.length - 1,
    };
};

/**
 * Accept a share — deep-copy the entire note tree into the recipient's account.
 * Returns the new root page created for the recipient.
 */
const acceptShare = async (token, recipientId) => {
    const share = await notesModel.getShareByToken(token);
    if (!share) throw new AppError('Share link is invalid or has expired.', 404);

    // Prevent owner from importing their own note
    if (share.shared_by === recipientId) {
        throw new AppError('You cannot import your own shared note.', 400);
    }

    // Deep copy the full page tree into recipient's root
    const newPageId = await notesModel.deepCopyPageTree(
        share.page_id,
        share.shared_by,
        recipientId,
        null   // top-level in recipient's workspace
    );

    const newPage = await notesModel.getPageById(newPageId, recipientId);
    return newPage;
};

// ─── Blocks ───────────────────────────────────────────────────────────────────

const createBlock = async (pageId, userId, data) => {
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    return notesModel.createBlock(pageId, data);
};

const updateBlock = async (blockId, userId, data) => {
    const block = await notesModel.getBlockById(blockId);
    if (!block) throw new AppError('Block not found.', 404);

    const page = await notesModel.getPageById(block.page_id, userId);
    if (!page) throw new AppError('Access denied.', 403);

    return notesModel.updateBlock(blockId, block.page_id, data);
};

const deleteBlock = async (blockId, userId) => {
    const block = await notesModel.getBlockById(blockId);
    if (!block) throw new AppError('Block not found.', 404);

    const page = await notesModel.getPageById(block.page_id, userId);
    if (!page) throw new AppError('Access denied.', 403);

    await notesModel.deleteBlock(blockId, block.page_id);
};

module.exports = {
    getPageTree,
    createPage,
    getPage,
    updatePage,
    setWritingMode,
    deletePage,
    duplicatePage,
    reorderChildren,
    shareNote,
    acceptShare,
    createBlock,
    updateBlock,
    deleteBlock,
};
