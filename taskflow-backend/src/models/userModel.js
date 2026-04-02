const db = require('../utils/db');

// ─── Users ────────────────────────────────────────────────────────────────────

// Automatically alter table independently without throwing exceptions if columns exist
db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL').catch(() => { });
db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL').catch(() => { });
db.query('ALTER TABLE users ADD COLUMN role ENUM("admin","user") DEFAULT "user"').catch(() => { });
db.query('ALTER TABLE users ADD COLUMN bio TEXT NULL').catch(() => { });

const createUser = async (name, email, hashedPassword, avatarInitials) => {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, avatar_initials) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, avatarInitials]
    );
    return result.insertId;
};

const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
};

const getUserById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, name, email, avatar_initials, role, bio, avatar_url, is_online, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

const updatePassword = async (userId, hashedPassword) => {
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
};

const setOnlineStatus = async (userId, isOnline) => {
    await db.query('UPDATE users SET is_online = ? WHERE id = ?', [isOnline ? 1 : 0, userId]);
};

// ─── Refresh Tokens ───────────────────────────────────────────────────────────

const saveRefreshToken = async (userId, token) => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );
};

const findRefreshToken = async (token) => {
    const [rows] = await db.query(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
        [token]
    );
    return rows[0] || null;
};

const deleteRefreshToken = async (token) => {
    await db.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

const deleteAllRefreshTokensForUser = async (userId) => {
    await db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
};

const updateUserProfile = async (userId, { name, avatar_initials, bio, avatar_url }) => {
    await db.query(
        'UPDATE users SET name = ?, avatar_initials = ?, bio = ?, avatar_url = ? WHERE id = ?',
        [name, avatar_initials, bio || null, avatar_url || null, userId]
    );
};

const verifyUserEmail = async (userId) => {
    await db.query('UPDATE users SET is_email_verified = 1 WHERE id = ?', [userId]);
};

const updateGoogleProfile = async (userId, googleId, avatarUrl) => {
    await db.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?', [googleId, avatarUrl, userId]);
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    updatePassword,
    updateUserProfile,
    setOnlineStatus,
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteAllRefreshTokensForUser,
    verifyUserEmail,
    updateGoogleProfile,
};
