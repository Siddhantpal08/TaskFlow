const asyncWrapper = require('../utils/asyncWrapper');
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

// ─── Pages ────────────────────────────────────────────────────────────────────

const getPages = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.query(
        `SELECT p.id, p.title, p.emoji, p.parent_id, p.position, p.updated_at, p.writing_mode, IF(p.user_id = ?, 1, 0) AS is_owner
         FROM notes_pages p WHERE p.user_id = ? AND p.deleted_at IS NULL
         UNION
         SELECT p.id, p.title, p.emoji, p.parent_id, p.position, p.updated_at, p.writing_mode, 0 AS is_owner
         FROM notes_pages p JOIN note_collaborators c ON p.id = c.page_id WHERE c.user_id = ? AND p.deleted_at IS NULL
         ORDER BY position ASC`,
        [userId, userId, userId]
    );
    // Build tree
    const map = {};
    const roots = [];
    rows.forEach(r => { map[r.id] = { ...r, children: [] }; });
    rows.forEach(r => {
        if (r.parent_id && map[r.parent_id]) map[r.parent_id].children.push(map[r.id]);
        else roots.push(map[r.id]);
    });
    res.json({ status: 'success', data: roots });
});

/** POST /api/college/v1/notes/pages */
const createPage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { title = 'Untitled', emoji = '📄', parentId = null } = req.body;
    const id = uuidv4();
    // Position = max + 1 under same parent
    const [[{ maxPos }]] = await db.query(
        'SELECT COALESCE(MAX(position), -1) + 1 AS maxPos FROM notes_pages WHERE user_id = ? AND parent_id <=> ?',
        [userId, parentId]
    );
    await db.query(
        'INSERT INTO notes_pages (id, user_id, parent_id, title, emoji, position) VALUES (?,?,?,?,?,?)',
        [id, userId, parentId, title, emoji, maxPos]
    );
    res.status(201).json({ status: 'success', data: { id, title, emoji, parentId, position: maxPos } });
});

/** GET /api/college/v1/notes/pages/:id */
const getPage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const [[page]] = await db.query(
        `SELECT p.id, p.title, p.emoji, p.parent_id, p.updated_at, p.writing_mode 
         FROM notes_pages p 
         LEFT JOIN note_collaborators c ON p.id = c.page_id AND c.user_id = ?
         WHERE p.id = ? AND (p.user_id = ? OR c.user_id = ?)`,
        [userId, id, userId, userId]
    );
    if (!page) return res.status(404).json({ status: 'fail', message: 'Page not found' });
    const [blocks] = await db.query(
        'SELECT id, type, content, checked, position, indent FROM notes_blocks WHERE page_id = ? ORDER BY position ASC',
        [id]
    );
    res.json({ status: 'success', data: { ...page, blocks } });
});

/** PUT /api/college/v1/notes/pages/:id */
const updatePage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, emoji } = req.body;
    const [[page]] = await db.query(
        `SELECT p.id FROM notes_pages p 
         LEFT JOIN note_collaborators c ON p.id = c.page_id AND c.user_id = ?
         WHERE p.id = ? AND (p.user_id = ? OR (c.user_id = ? AND c.can_edit = TRUE))`,
        [userId, id, userId, userId]
    );
    if (!page) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    await db.query(
        'UPDATE notes_pages SET title = COALESCE(?, title), emoji = COALESCE(?, emoji) WHERE id = ?',
        [title ?? null, emoji ?? null, id]
    );
    res.json({ status: 'success', data: { id, title, emoji } });
});

/** DELETE /api/college/v1/notes/pages/:id */
const deletePage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await db.query('UPDATE notes_pages SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ status: 'success', message: 'Page moved to trash' });
});

/** GET /api/college/v1/notes/trash */
const getDeletedPages = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.query(
        `SELECT id, title, emoji, deleted_at, parent_id, updated_at
         FROM notes_pages WHERE user_id = ? AND deleted_at IS NOT NULL
         ORDER BY deleted_at DESC`,
        [userId]
    );
    res.json({ status: 'success', data: rows });
});

/** PATCH /api/college/v1/notes/pages/:id/restore */
const restorePage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await db.query('UPDATE notes_pages SET deleted_at = NULL WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ status: 'success', message: 'Page restored' });
});

/** DELETE /api/college/v1/notes/pages/:id/permanent */
const hardDeletePage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    await db.query('DELETE FROM notes_pages WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ status: 'success', message: 'Page permanently deleted' });
});

/** POST /api/college/v1/notes/pages/:id/duplicate */
const duplicatePage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const [[page]] = await db.query('SELECT * FROM notes_pages WHERE id = ? AND user_id = ?', [id, userId]);
    if (!page) return res.status(404).json({ status: 'fail', message: 'Page not found' });
    const newId = uuidv4();
    await db.query(
        'INSERT INTO notes_pages (id, user_id, parent_id, title, emoji, position) VALUES (?,?,?,?,?,?)',
        [newId, userId, page.parent_id, `${page.title} (Copy)`, page.emoji, page.position + 1]
    );
    const [blocks] = await db.query('SELECT * FROM notes_blocks WHERE page_id = ? ORDER BY position ASC', [id]);
    for (const b of blocks) {
        await db.query(
            'INSERT INTO notes_blocks (id, page_id, type, content, checked, position, indent) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), newId, b.type, b.content, b.checked, b.position, b.indent || 0]
        );
    }
    res.status(201).json({ status: 'success', data: { id: newId } });
});

/** PATCH /api/college/v1/notes/pages/:id/reorder */
const reorderPages = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { orderedIds } = req.body;
    for (let i = 0; i < orderedIds.length; i++) {
        await db.query('UPDATE notes_pages SET position = ? WHERE id = ? AND user_id = ?', [i, orderedIds[i], userId]);
    }
    res.json({ status: 'success', message: 'Reordered' });
});

/** PATCH /api/college/v1/notes/pages/:id/mode */
const setWritingMode = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { mode } = req.body;
    await db.query('UPDATE notes_pages SET writing_mode = ? WHERE id = ? AND user_id = ?', [mode, id, userId]);
    res.json({ status: 'success', data: { mode } });
});

/** POST /api/college/v1/notes/pages/:id/share — generate share token */
const sharePage = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const [[page]] = await db.query('SELECT * FROM notes_pages WHERE id = ? AND user_id = ?', [id, userId]);
    if (!page) return res.status(404).json({ status: 'fail', message: 'Page not found' });
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.query(
        'INSERT INTO note_shares (id, token, page_id, shared_by, expires_at) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE token=VALUES(token), expires_at=VALUES(expires_at)',
        [uuidv4(), token, id, userId, expiresAt]
    );
    const shareUrl = `${process.env.CLIENT_URL || 'https://taskflow-by-crevio.vercel.app'}/?note=${id}&token=${token}`;
    res.json({ status: 'success', data: { token, shareUrl } });
});

/** POST /api/college/v1/notes/accept-share/:token — copy shared note to user's workspace */
const acceptShare = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { token } = req.params;
    const { mode = 'copy' } = req.body; // 'copy' or 'collab'
    const [[share]] = await db.query(
        'SELECT ns.*, np.title, np.emoji, np.writing_mode, np.id as page_id FROM note_shares ns JOIN notes_pages np ON ns.page_id = np.id WHERE ns.token = ? AND ns.expires_at > NOW()',
        [token]
    );
    if (!share) return res.status(404).json({ status: 'fail', message: 'Share link invalid or expired' });
    
    if (mode === 'collab') {
        await db.query(
            'INSERT IGNORE INTO note_collaborators (page_id, user_id, can_edit) VALUES (?, ?, TRUE)',
            [share.page_id, userId]
        );
        return res.status(200).json({ status: 'success', data: { id: share.page_id, title: share.title } });
    }

    // Deep copy the page
    const newId = uuidv4();
    await db.query(
        'INSERT INTO notes_pages (id, user_id, parent_id, title, emoji, position, writing_mode) VALUES (?,?,NULL,?,?,0,?)',
        [newId, userId, `${share.title} (Shared)`, share.emoji, share.writing_mode || null]
    );
    const [blocks] = await db.query('SELECT * FROM notes_blocks WHERE page_id = ?', [share.page_id]);
    for (const b of blocks) {
        await db.query(
            'INSERT INTO notes_blocks (id, page_id, type, content, checked, position, indent) VALUES (?,?,?,?,?,?,?)',
            [uuidv4(), newId, b.type, b.content, b.checked, b.position, b.indent || 0]
        );
    }
    res.status(201).json({ status: 'success', data: { id: newId, title: share.title } });
});

// ─── Blocks ───────────────────────────────────────────────────────────────────

/** POST /api/college/v1/notes/pages/:pageId/blocks */
const createBlock = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { pageId } = req.params;
    
    const [[page]] = await db.query(
        `SELECT p.id FROM notes_pages p 
         LEFT JOIN note_collaborators c ON p.id = c.page_id AND c.user_id = ?
         WHERE p.id = ? AND (p.user_id = ? OR (c.user_id = ? AND c.can_edit = TRUE))`,
        [userId, pageId, userId, userId]
    );
    if (!page) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    const { type = 'p', content = '', position = 0, checked = false, indent = 0 } = req.body;
    const id = uuidv4();
    await db.query(
        'INSERT INTO notes_blocks (id, page_id, type, content, checked, position, indent) VALUES (?,?,?,?,?,?,?)',
        [id, pageId, type, content, checked ? 1 : 0, position, indent]
    );
    res.status(201).json({ status: 'success', data: { id, type, content, checked, position, indent } });
});

/** PUT /api/college/v1/notes/blocks/:blockId */
const updateBlock = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { blockId } = req.params;
    
    const [[block]] = await db.query(
        `SELECT b.id FROM notes_blocks b
         JOIN notes_pages p ON b.page_id = p.id
         LEFT JOIN note_collaborators c ON p.id = c.page_id AND c.user_id = ?
         WHERE b.id = ? AND (p.user_id = ? OR (c.user_id = ? AND c.can_edit = TRUE))`,
        [userId, blockId, userId, userId]
    );
    if (!block) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    const { type, content, checked, position, indent } = req.body;
    await db.query(
        `UPDATE notes_blocks SET
            type = COALESCE(?, type),
            content = COALESCE(?, content),
            checked = COALESCE(?, checked),
            position = COALESCE(?, position),
            indent = COALESCE(?, indent)
         WHERE id = ?`,
        [type ?? null, content ?? null, checked !== undefined ? (checked ? 1 : 0) : null, position ?? null, indent ?? null, blockId]
    );
    res.json({ status: 'success', data: { id: blockId } });
});

/** DELETE /api/college/v1/notes/blocks/:blockId */
const deleteBlock = asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    const { blockId } = req.params;
    
    const [[block]] = await db.query(
        `SELECT b.id FROM notes_blocks b
         JOIN notes_pages p ON b.page_id = p.id
         LEFT JOIN note_collaborators c ON p.id = c.page_id AND c.user_id = ?
         WHERE b.id = ? AND (p.user_id = ? OR (c.user_id = ? AND c.can_edit = TRUE))`,
        [userId, blockId, userId, userId]
    );
    if (!block) return res.status(403).json({ status: 'fail', message: 'Unauthorized' });

    await db.query('DELETE FROM notes_blocks WHERE id = ?', [blockId]);
    res.json({ status: 'success', message: 'Block deleted' });
});

module.exports = {
    getPages, createPage, getPage, updatePage, deletePage,
    getDeletedPages, restorePage, hardDeletePage,
    duplicatePage, reorderPages, setWritingMode, sharePage, acceptShare,
    createBlock, updateBlock, deleteBlock,
};
