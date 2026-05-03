const db = require('../utils/db');

// ─── Notes (flat table) ───────────────────────────────────────────────────────

const getAllNotes = async (userId) => {
    const [rows] = await db.query(
        `SELECT id, title, content, updated_at
         FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
        [userId]
    );
    return rows;
};

const getNoteById = async (id, userId) => {
    const [rows] = await db.query(
        `SELECT id, user_id, title, content, updated_at
         FROM notes WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return rows[0] || null;
};

const createNote = async (userId, { title = 'Untitled', content = '' }) => {
    const [result] = await db.query(
        `INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)`,
        [userId, title, content]
    );
    return getNoteById(result.insertId, userId);
};

const updateNote = async (id, userId, { title, content }) => {
    const sets = [];
    const values = [];
    if (title !== undefined) { sets.push('title = ?'); values.push(title); }
    if (content !== undefined) { sets.push('content = ?'); values.push(content); }
    if (sets.length === 0) return getNoteById(id, userId);
    values.push(id, userId);
    await db.query(`UPDATE notes SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, values);
    return getNoteById(id, userId);
};

const deleteNote = async (id, userId) => {
    const [result] = await db.query(
        `DELETE FROM notes WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
};

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
