const asyncWrapper = require('../utils/asyncWrapper');
const db = require('../utils/db');
const { AppError } = require('../middleware/errorHandler');
const mailer = require('../utils/mailer');

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
    // Also fetch support tickets
    const [tickets] = await db.query(
        `SELECT t.id, t.title, t.category, t.description, t.status, t.created_at, u.name, u.email
         FROM support_tickets t
         LEFT JOIN users u ON u.id = t.user_id
         ORDER BY t.created_at DESC
         LIMIT 200`
    );

    res.status(200).json({ success: true, data: { feedback: rows, tickets } });
});

/**
 * PATCH /api/v1/feedback/:id/status
 */
const updateFeedbackStatus = asyncWrapper(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new AppError('Admin access required.', 403);
    }
    const feedbackId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['pending', 'done'].includes(status)) {
        throw new AppError('Invalid status.', 400);
    }
    
    await db.query(`UPDATE feedback SET status = ? WHERE id = ?`, [status, feedbackId]);
    
    const [[feedback]] = await db.query(
        `SELECT f.*, u.email, u.name FROM feedback f JOIN users u ON u.id = f.user_id WHERE f.id = ?`,
        [feedbackId]
    );
    
    if (feedback && feedback.email && status === 'done') {
        await mailer.sendSupportTicketEmail(
            feedback.email, 
            `Your feedback ("${feedback.message.slice(0, 30)}...") has been reviewed and implemented!`,
            `Feedback #${feedbackId}`
        );
    }
    
    res.json({ success: true, message: 'Status updated' });
});

/**
 * DELETE /api/v1/feedback/:id
 */
const deleteFeedback = asyncWrapper(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new AppError('Admin access required.', 403);
    }
    const feedbackId = parseInt(req.params.id);
    await db.query(`DELETE FROM feedback WHERE id = ?`, [feedbackId]);
    res.json({ success: true, message: 'Feedback deleted' });
});

/**
 * PUT /api/v1/feedback/:id/upvote — Any logged-in user can upvote a feedback entry
 * Uses a separate table to prevent double-voting.
 */
const upvoteFeedback = asyncWrapper(async (req, res) => {
    const paramId = req.params.id; // 'f_1' or 't_2'
    const userId = req.user.id;

    if (!paramId) throw new AppError('Invalid ID.', 400);

    const type = paramId.startsWith('f_') ? 'feedback' : paramId.startsWith('t_') ? 'ticket' : null;
    const actualId = parseInt(paramId.substring(2));

    if (!type || isNaN(actualId)) {
        throw new AppError('Invalid ID format.', 400);
    }

    try {
        if (type === 'feedback') {
            const [[existing]] = await db.query(`SELECT 1 FROM feedback_votes WHERE user_id = ? AND feedback_id = ?`, [userId, actualId]);
            if (existing) {
                await db.query(`DELETE FROM feedback_votes WHERE user_id = ? AND feedback_id = ?`, [userId, actualId]);
            } else {
                await db.query(`INSERT INTO feedback_votes (user_id, feedback_id) VALUES (?, ?)`, [userId, actualId]);
            }
            await db.query(
                `UPDATE feedback SET upvotes = (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = ?) WHERE id = ?`,
                [actualId, actualId]
            );
            const [[row]] = await db.query(`SELECT upvotes FROM feedback WHERE id = ?`, [actualId]);
            res.json({ success: true, upvotes: row?.upvotes || 0 });
        } else {
            const [[existing]] = await db.query(`SELECT 1 FROM support_ticket_votes WHERE user_id = ? AND ticket_id = ?`, [userId, actualId]);
            if (existing) {
                await db.query(`DELETE FROM support_ticket_votes WHERE user_id = ? AND ticket_id = ?`, [userId, actualId]);
            } else {
                await db.query(`INSERT INTO support_ticket_votes (user_id, ticket_id) VALUES (?, ?)`, [userId, actualId]);
            }
            await db.query(
                `UPDATE support_tickets SET upvotes = (SELECT COUNT(*) FROM support_ticket_votes WHERE ticket_id = ?) WHERE id = ?`,
                [actualId, actualId]
            );
            const [[row]] = await db.query(`SELECT upvotes FROM support_tickets WHERE id = ?`, [actualId]);
            res.json({ success: true, upvotes: row?.upvotes || 0 });
        }
    } catch (e) {
        throw new AppError('Failed to toggle upvote.', 500);
    }
});

/**
 * PATCH /api/v1/feedback/tickets/:id/status
 */
const updateTicketStatus = asyncWrapper(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new AppError('Admin access required.', 403);
    }
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['open', 'in_progress', 'done', 'resolved'].includes(status)) {
        throw new AppError('Invalid status.', 400);
    }
    
    await db.query(`UPDATE support_tickets SET status = ? WHERE id = ?`, [status, ticketId]);
    
    const [[ticket]] = await db.query(
        `SELECT t.*, u.email, u.name FROM support_tickets t JOIN users u ON u.id = t.user_id WHERE t.id = ?`,
        [ticketId]
    );
    
    if (ticket && ticket.email && (status === 'done' || status === 'resolved')) {
        await mailer.sendSupportTicketEmail(
            ticket.email, 
            `Your support ticket regarding "${ticket.title}" has been addressed and resolved!`,
            `Ticket #${ticketId}`
        );
    }
    
    res.json({ success: true, message: 'Ticket status updated' });
});

/**
 * DELETE /api/v1/feedback/tickets/:id
 */
const deleteTicket = asyncWrapper(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new AppError('Admin access required.', 403);
    }
    const ticketId = parseInt(req.params.id);
    await db.query(`DELETE FROM support_tickets WHERE id = ?`, [ticketId]);
    res.json({ success: true, message: 'Support ticket deleted' });
});

/**
 * GET /api/v1/feedback/public — Returns top feedback entries (anonymized) for the public board
 */
const getPublicFeedboard = asyncWrapper(async (req, res) => {
    const [rows] = await db.query(
        `SELECT id, rating, message, upvotes, created_at, status, author_initial
         FROM (
             SELECT CONCAT('f_', f.id) as id, f.rating, f.message, f.upvotes, f.created_at, f.status,
                    CONCAT(LEFT(u.name, LOCATE(' ', CONCAT(u.name,' '))-1), '.') AS author_initial
             FROM feedback f
             LEFT JOIN users u ON u.id = f.user_id
             
             UNION ALL
             
             SELECT CONCAT('t_', t.id) as id, 5 as rating, t.title as message, t.upvotes, t.created_at, t.status,
                    CONCAT(LEFT(u.name, LOCATE(' ', CONCAT(u.name,' '))-1), '.') AS author_initial
             FROM support_tickets t
             LEFT JOIN users u ON u.id = t.user_id
         ) combined
         ORDER BY upvotes DESC, created_at DESC
         LIMIT 50`
    );
    res.json({ success: true, data: rows });
});

/**
 * POST /api/v1/tickets
 */
const submitTicket = asyncWrapper(async (req, res) => {
    const { title, category, description } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
        throw new AppError('Title and description are required.', 400);
    }

    const [result] = await db.query(
        `INSERT INTO support_tickets (user_id, title, category, description) VALUES (?, ?, ?, ?)`,
        [userId, title, category || 'other', description]
    );

    const ticketId = result.insertId;

    // Trigger Brevo mailer
    const [[user]] = await db.query(`SELECT email FROM users WHERE id = ?`, [userId]);
    if (user && user.email) {
        await mailer.sendSupportTicketEmail(user.email, title, ticketId);
    }

    res.status(201).json({ success: true, message: 'Ticket submitted successfully!' });
});

module.exports = { submitFeedback, getFeedback, submitTicket, upvoteFeedback, getPublicFeedboard, updateFeedbackStatus, deleteFeedback, updateTicketStatus, deleteTicket };
