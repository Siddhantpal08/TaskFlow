const db = require('../utils/db');

// ─── Events ───────────────────────────────────────────────────────────────────

const createEvent = async (userId, { title, description, event_date, end_date, event_time, priority, recurrence }) => {
    const [result] = await db.query(
        `INSERT INTO events (user_id, title, description, event_date, end_date, event_time, priority, recurrence)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, description || null, event_date, end_date || null, event_time || null, priority || 'low', recurrence || 'none']
    );
    return getEventById(result.insertId, userId);
};

const getEventById = async (id, userId) => {
    const [rows] = await db.query(
        `SELECT * FROM events WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return rows[0] || null;
};

/**
 * Get events for a specific month + tasks with due_dates in that month.
 * Returns { events: [...], taskDates: [...] }
 */
const getEventsForMonth = async (userId, year, month) => {
    // Events
    // To include multi-day events, we'll fetch events where the given month/year falls between event_date and end_date (or just event_date if end_date doesn't exist)
    const [events] = await db.query(
        `SELECT * FROM events
         WHERE user_id = ? 
           AND (
             (YEAR(event_date) = ? AND MONTH(event_date) = ?) OR
             (end_date IS NOT NULL AND YEAR(end_date) = ? AND MONTH(end_date) = ?) OR
             (end_date IS NOT NULL AND event_date <= LAST_DAY(CONCAT(?, '-', LPAD(?, 2, '0'), '-01')) AND end_date >= CONCAT(?, '-', LPAD(?, 2, '0'), '-01')) OR
             (recurrence != 'none')
           )
         ORDER BY event_date ASC, event_time ASC`,
        [userId, year, month, year, month, year, month, year, month]
    );

    // Task due dates in the same month (tasks visible to user)
    const [taskDates] = await db.query(
        `SELECT id, title, priority, status, due_date
         FROM tasks
         WHERE (assigned_by = ? OR assigned_to = ?)
           AND YEAR(due_date) = ? AND MONTH(due_date) = ?
           AND due_date IS NOT NULL`,
        [userId, userId, year, month]
    );

    return { events, taskDates };
};

const updateEvent = async (id, userId, { title, description, event_date, end_date, event_time, priority, recurrence }) => {
    await db.query(
        `UPDATE events SET title = ?, description = ?, event_date = ?, end_date = ?, event_time = ?, priority = ?, recurrence = ?
         WHERE id = ? AND user_id = ?`,
        [title, description || null, event_date, end_date || null, event_time || null, priority || 'low', recurrence || 'none', id, userId]
    );
    return getEventById(id, userId);
};

const deleteEvent = async (id, userId) => {
    const [result] = await db.query(`DELETE FROM events WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
};

/** Get upcoming events (next N days) for dashboard */
const getUpcomingEvents = async (userId, limit = 3) => {
    const [rows] = await db.query(
        `SELECT * FROM events
         WHERE user_id = ? AND event_date >= CURDATE()
         ORDER BY event_date ASC, event_time ASC
         LIMIT ?`,
        [userId, limit]
    );
    return rows;
};

module.exports = { createEvent, getEventById, getEventsForMonth, updateEvent, deleteEvent, getUpcomingEvents };
