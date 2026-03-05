const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

// ─── Pages ────────────────────────────────────────────────────────────────────

const createPage = async (userId, { parentId = null, title = 'Untitled', emoji = null, position = 0 }) => {
    const id = uuidv4();
    await db.query(
        `INSERT INTO notes_pages (id, user_id, parent_id, title, emoji, position) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, parentId || null, title, emoji || null, position]
    );
    return getPageById(id, userId);
};

const getPageTree = async (userId) => {
    const [rows] = await db.query(
        `SELECT id, parent_id, title, emoji, position, updated_at
         FROM notes_pages WHERE user_id = ? ORDER BY position ASC, updated_at DESC`,
        [userId]
    );
    return rows;
};

const getPageById = async (id, userId) => {
    const [rows] = await db.query(
        `SELECT id, user_id, parent_id, title, emoji, position, updated_at
         FROM notes_pages WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return rows[0] || null;
};

const getPageWithBlocks = async (id, userId) => {
    const page = await getPageById(id, userId);
    if (!page) return null;

    const [blocks] = await db.query(
        `SELECT id, page_id, type, content, checked, position
         FROM notes_blocks WHERE page_id = ? ORDER BY position ASC`,
        [id]
    );

    // Get direct sub-page stubs
    const [subPages] = await db.query(
        `SELECT id, title, emoji, position FROM notes_pages
         WHERE parent_id = ? AND user_id = ? ORDER BY position ASC`,
        [id, userId]
    );

    return { ...page, blocks, subPages };
};

const updatePage = async (id, userId, { title, emoji, position }) => {
    await db.query(
        `UPDATE notes_pages SET title = ?, emoji = ?, position = ? WHERE id = ? AND user_id = ?`,
        [title, emoji !== undefined ? emoji : null, position, id, userId]
    );
    return getPageById(id, userId);
};

/**
 * Recursively delete a page and all its descendants.
 * Uses a recursive CTE-equivalent via repeated queries (compatible with MySQL 8+).
 */
const deletePageRecursive = async (id, userId) => {
    // Collect all descendant IDs (BFS)
    const allIds = [id];
    const queue = [id];

    while (queue.length) {
        const current = queue.shift();
        const [children] = await db.query(
            `SELECT id FROM notes_pages WHERE parent_id = ? AND user_id = ?`,
            [current, userId]
        );
        for (const child of children) {
            allIds.push(child.id);
            queue.push(child.id);
        }
    }

    // Delete all (blocks cascade via FK)
    const placeholders = allIds.map(() => '?').join(',');
    await db.query(
        `DELETE FROM notes_pages WHERE id IN (${placeholders}) AND user_id = ?`,
        [...allIds, userId]
    );

    return allIds.length;
};

/** Reorder sibling pages by updating their position values */
const reorderChildren = async (parentId, userId, orderedIds) => {
    const updates = orderedIds.map((id, index) =>
        db.query('UPDATE notes_pages SET position = ? WHERE id = ? AND user_id = ?', [index, id, userId])
    );
    await Promise.all(updates);
};

// ─── Blocks ───────────────────────────────────────────────────────────────────

const createBlock = async (pageId, { type = 'p', content = '', checked = 0, position = 0 }) => {
    const id = uuidv4();
    await db.query(
        `INSERT INTO notes_blocks (id, page_id, type, content, checked, position) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, pageId, type, content, checked ? 1 : 0, position]
    );
    const [rows] = await db.query(`SELECT * FROM notes_blocks WHERE id = ?`, [id]);
    return rows[0];
};

const updateBlock = async (blockId, pageId, { content, checked, type }) => {
    await db.query(
        `UPDATE notes_blocks SET content = ?, checked = ?, type = ? WHERE id = ? AND page_id = ?`,
        [content ?? '', checked !== undefined ? (checked ? 1 : 0) : 0, type || 'p', blockId, pageId]
    );
    const [rows] = await db.query(`SELECT * FROM notes_blocks WHERE id = ?`, [blockId]);
    return rows[0] || null;
};

const deleteBlock = async (blockId, pageId) => {
    await db.query(`DELETE FROM notes_blocks WHERE id = ? AND page_id = ?`, [blockId, pageId]);
};

/** Get the pageId that owns a block (used for authorization) */
const getBlockById = async (blockId) => {
    const [rows] = await db.query(`SELECT * FROM notes_blocks WHERE id = ?`, [blockId]);
    return rows[0] || null;
};

module.exports = {
    createPage,
    getPageTree,
    getPageById,
    getPageWithBlocks,
    updatePage,
    deletePageRecursive,
    reorderChildren,
    createBlock,
    updateBlock,
    deleteBlock,
    getBlockById,
};
