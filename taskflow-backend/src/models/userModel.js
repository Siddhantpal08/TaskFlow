const db = require('../utils/db');

const createUser = async (name, email, hashedPassword) => {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
    );
    return result.insertId;
};

const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length ? rows[0] : null;
};

const getUserById = async (id) => {
    const [rows] = await db.query('SELECT id, name, email, avatar_initials, is_online, created_at FROM users WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const saveRefreshToken = async (userId, token) => {
    // Add expires_at value corresponding to 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );
};

const findRefreshToken = async (token) => {
    const [rows] = await db.query('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()', [token]);
    return rows.length ? rows[0] : null;
};

const deleteRefreshToken = async (token) => {
    await db.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken
};
