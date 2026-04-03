const notesModel = require('../models/notesModel');
const { AppError } = require('../middleware/errorHandler');

// ─── Pages ────────────────────────────────────────────────────────────────────

/**
 * Build a nested tree from the flat list returned by getPageTree.
 * Each node: { id, parent_id, title, emoji, position, children[] }
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
    // Validate parent ownership if parentId provided
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

const deletePage = async (pageId, userId) => {
    const page = await notesModel.getPageById(pageId, userId);
    if (!page) throw new AppError('Page not found.', 404);
    if (page.user_id !== userId) throw new AppError('Only the owner can delete this page.', 403);

    // Root-level protection: if page has no parent_id, it cannot be the very last page.
    // We allow deletion but always allow it here (UI should confirm).
    const count = await notesModel.deletePageRecursive(pageId, userId);
    return { deletedCount: count };
};

const reorderChildren = async (parentId, userId, orderedIds) => {
    // Validate all provided IDs belong to this user
    const checks = orderedIds.map((id) => notesModel.getPageById(id, userId));
    const pages = await Promise.all(checks);
    const invalid = pages.filter((p) => !p || p.user_id !== userId);
    if (invalid.length > 0) {
        throw new AppError('One or more page IDs not found or not owned by you.', 403);
    }

    await notesModel.reorderChildren(parentId, userId, orderedIds);
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

    // Validate the block's page belongs to user
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
    deletePage,
    reorderChildren,
    createBlock,
    updateBlock,
    deleteBlock,
};
