const asyncWrapper = require('../utils/asyncWrapper');
const db = require('../utils/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/v1/feedback (and /api/college/v1/feedback)
 * Saves user feedback (rating + message) to the DB.
 * Also logs to console so it appears in Render logs for quick monitoring.
 */
const submitFeedback = asyncWrapper(async (req, res) => {
    const { rating, message } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5.', 400);
    }
    if (!message || !message.trim()) {
        throw new AppError('Feedback message is required.', 400);
    }

    await db.query(
        `INSERT INTO feedback (user_id, rating, message) VALUES (?, ?, ?)`,
        [userId, rating, message.trim().slice(0, 2000)]
    );

    // Log to Render console for easy monitoring (no email service needed)
    console.log(
        `[FEEDBACK] ⭐${rating}/5 from user #${userId}: "${message.slice(0, 120)}${message.length > 120 ? '...' : ''}"`
    );

    res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
});

/**
 * GET /api/v1/feedback — Admin only, returns all feedback
 */
const getFeedback = asyncWrapper(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new AppError('Admin access required.', 403);
    }
    const [rows] = await db.query(
        `SELECT f.id, f.rating, f.message, f.created_at, u.name, u.email
         FROM feedback f
         LEFT JOIN users u ON u.id = f.user_id
         ORDER BY f.created_at DESC
         LIMIT 200`
    );
    res.status(200).json({ success: true, data: rows });
});

module.exports = { submitFeedback, getFeedback };
