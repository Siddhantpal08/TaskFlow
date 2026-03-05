const db = require('../utils/db');
const taskModel = require('./taskModel');

/**
 * Get all users with their task counts and online status (for Team view).
 */
const getAllTeamMembers = async () => {
    const [rows] = await db.query(
        `SELECT u.id, u.name, u.email, u.avatar_initials, u.is_online, u.created_at,
                COUNT(t.id) AS tasks_assigned_count
         FROM users u
         LEFT JOIN tasks t ON t.assigned_to = u.id AND t.status != 'done'
         GROUP BY u.id
         ORDER BY u.name ASC`
    );
    return rows;
};

/**
 * Get activity log for a specific user:
 * - Tasks they created
 * - Tasks assigned to them
 * - Delegation chains involving them
 */
const getUserActivity = async (userId) => {
    // Recent tasks created by user
    const [created] = await db.query(
        `SELECT t.id, t.title, t.status, t.priority, t.created_at,
                u.name AS assigned_to_name
         FROM tasks t JOIN users u ON u.id = t.assigned_to
         WHERE t.assigned_by = ?
         ORDER BY t.created_at DESC LIMIT 20`,
        [userId]
    );

    // Recent tasks assigned to user
    const [assigned] = await db.query(
        `SELECT t.id, t.title, t.status, t.priority, t.created_at,
                u.name AS assigned_by_name
         FROM tasks t JOIN users u ON u.id = t.assigned_by
         WHERE t.assigned_to = ?
         ORDER BY t.created_at DESC LIMIT 20`,
        [userId]
    );

    // Delegation chains: tasks where user is in the chain (parent_task_id is set)
    const [delegations] = await db.query(
        `SELECT t.id, t.title, t.status, t.parent_task_id,
                u1.name AS assigned_by_name, u2.name AS assigned_to_name
         FROM tasks t
         JOIN users u1 ON u1.id = t.assigned_by
         JOIN users u2 ON u2.id = t.assigned_to
         WHERE (t.assigned_by = ? OR t.assigned_to = ?) AND t.parent_task_id IS NOT NULL
         ORDER BY t.created_at DESC LIMIT 20`,
        [userId, userId]
    );

    return { created, assigned, delegations };
};

module.exports = { getAllTeamMembers, getUserActivity };
