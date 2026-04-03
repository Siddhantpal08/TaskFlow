const db = require('../utils/db');

// Ensure table exists on first run (development fallback)
db.query(`
    CREATE TABLE IF NOT EXISTS friends (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requester_id INT UNSIGNED NOT NULL,
        recipient_id INT UNSIGNED NOT NULL,
        status ENUM('pending', 'accepted') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_friendship (requester_id, recipient_id)
    )
`).catch(console.error);

const sendRequest = async (requesterId, recipientId) => {
    // Check if any relationship already exists in either direction
    const [existing] = await db.query(
        `SELECT * FROM friends 
         WHERE (requester_id = ? AND recipient_id = ?) 
            OR (requester_id = ? AND recipient_id = ?)`,
        [requesterId, recipientId, recipientId, requesterId]
    );

    if (existing.length > 0) {
        throw new Error('Friend request already sent or you are already friends.');
    }

    const [result] = await db.query(
        `INSERT INTO friends (requester_id, recipient_id, status) VALUES (?, ?, 'pending')`,
        [requesterId, recipientId]
    );
    return result.insertId;
};

const acceptRequest = async (requestId, userId) => {
    // Only recipient can accept
    const [req] = await db.query(
        `SELECT * FROM friends WHERE id = ? AND recipient_id = ? AND status = 'pending'`,
        [requestId, userId]
    );
    if (req.length === 0) throw new Error('Request not found or already accepted.');

    await db.query(`UPDATE friends SET status = 'accepted' WHERE id = ?`, [requestId]);
};

const getFriends = async (userId) => {
    const [rows] = await db.query(
        `SELECT u.id, u.name, u.email, u.avatar_initials, u.avatar_url, u.bio, u.is_online 
         FROM friends f
         JOIN users u ON (u.id = f.requester_id OR u.id = f.recipient_id)
         WHERE (f.requester_id = ? OR f.recipient_id = ?) 
           AND u.id != ? 
           AND f.status = 'accepted'`,
        [userId, userId, userId]
    );
    return rows;
};

const getPendingRequests = async (userId) => {
    const [requests] = await db.query(
        `SELECT f.id as request_id, u.id as user_id, u.name, u.email, u.avatar_initials, u.avatar_url, f.created_at
         FROM friends f
         JOIN users u ON u.id = f.requester_id
         WHERE f.recipient_id = ? AND f.status = 'pending'`,
        [userId]
    );
    return requests;
};

const removeFriendOrRequest = async (friendshipId, userId) => {
    // Only allowed if user is requester or recipient
    await db.query(
        `DELETE FROM friends WHERE id = ? AND (requester_id = ? OR recipient_id = ?)`,
        [friendshipId, userId, userId]
    );
};

module.exports = {
    sendRequest,
    acceptRequest,
    getFriends,
    getPendingRequests,
    removeFriendOrRequest
};
