const db = require('../utils/db');

const saveMessage = async (teamId, userId, message) => {
    const [result] = await db.query(
        `INSERT INTO team_chats (team_id, user_id, message) VALUES (?, ?, ?)`,
        [teamId, userId, message]
    );
    const [rows] = await db.query(`SELECT * FROM team_chats WHERE id = ?`, [result.insertId]);
    return rows[0];
};

const getMessages = async (teamId, limit = 50) => {
    const [rows] = await db.query(
        `SELECT c.*, u.name as sender_name, u.avatar_initials as sender_initials, u.avatar_url as sender_avatar 
         FROM team_chats c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.team_id = ? 
         ORDER BY c.created_at DESC 
         LIMIT ?`,
        [teamId, limit]
    );
    return rows.reverse();
};

module.exports = { saveMessage, getMessages };
