const db = require('../utils/db');

const createNotification = async (userId, type, message, refId = null) => {
    const [result] = await db.query(
        `INSERT INTO notifications (user_id, type, message, ref_id) VALUES (?, ?, ?, ?)`,
        [userId, type, message, refId]
    );
    const [rows] = await db.query(`SELECT * FROM notifications WHERE id = ?`, [result.insertId]);
    return rows[0];
};

const getNotificationsForUser = async (userId, since = null) => {
    let sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`;
    const params = [userId];

    if (since) {
        sql = `SELECT * FROM notifications WHERE user_id = ? AND created_at > ? ORDER BY created_at DESC`;
        params.push(since);
    }

    const [rows] = await db.query(sql, params);
    return rows;
};

const getUnreadCount = async (userId) => {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
        [userId]
    );
    return rows[0].count;
};

const markAllRead = async (userId) => {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
};

const markOneRead = async (id, userId) => {
    const [result] = await db.query(
        `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
};

module.exports = { createNotification, getNotificationsForUser, getUnreadCount, markAllRead, markOneRead };
