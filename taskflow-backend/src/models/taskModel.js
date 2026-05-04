const db = require('../utils/db');

// ─── Create ───────────────────────────────────────────────────────────────────

const createTask = async ({ title, description, priority, assigned_by, assigned_to, due_date }) => {
    const [result] = await db.query(
        `INSERT INTO tasks (title, description, priority, assigned_by, assigned_to, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description || null, priority || 'medium', assigned_by, assigned_to, due_date || null]
    );
    return result.insertId;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

const getTaskById = async (id) => {
    const [rows] = await db.query(
        `SELECT t.*,
                u1.name AS assigned_by_name, u1.avatar_initials AS assigned_by_initials,
                u2.name AS assigned_to_name, u2.avatar_initials AS assigned_to_initials
         FROM tasks t
         JOIN users u1 ON u1.id = t.assigned_by
         JOIN users u2 ON u2.id = t.assigned_to
         WHERE t.id = ?`,
        [id]
    );
    return rows[0] || null;
};

/**
 * List tasks visible to a user (tasks they created OR are assigned to).
 * Optional filters: status, priority, assignee (assigned_to id).
 */
const getTasksForUser = async (userId, filters = {}) => {
    let sql = `
        SELECT t.*,
               u1.name AS assigned_by_name, u1.avatar_initials AS assigned_by_initials,
               u2.name AS assigned_to_name, u2.avatar_initials AS assigned_to_initials
        FROM tasks t
        JOIN users u1 ON u1.id = t.assigned_by
        JOIN users u2 ON u2.id = t.assigned_to
        WHERE (t.assigned_by = ? OR t.assigned_to = ?)
    `;
    const params = [userId, userId];

    if (filters.status) {
        sql += ' AND t.status = ?';
        params.push(filters.status);
    }
    if (filters.priority) {
        sql += ' AND t.priority = ?';
        params.push(filters.priority);
    }
    if (filters.assignee) {
        sql += ' AND t.assigned_to = ?';
        params.push(filters.assignee);
    }

    sql += ' ORDER BY t.created_at DESC';
    const [rows] = await db.query(sql, params);
    return rows;
};

/** Get all delegated (child) tasks for a given parent task */
const getSubTasks = async (parentTaskId) => {
    const [rows] = await db.query(
        `SELECT t.*, u.name AS assigned_to_name, u.avatar_initials AS assigned_to_initials
         FROM tasks t JOIN users u ON u.id = t.assigned_to
         WHERE t.parent_task_id = ?`,
        [parentTaskId]
    );
    return rows;
};

/** Count tasks assigned to a user (for team view) */
const getTaskCountByUser = async (userId) => {
    const [rows] = await db.query(
        'SELECT COUNT(*) AS count FROM tasks WHERE assigned_to = ?',
        [userId]
    );
    return rows[0].count;
};

/** Get tasks due within the next N hours for a user */
const getTasksDueSoon = async (userId, withinHours = 48) => {
    const [rows] = await db.query(
        `SELECT * FROM tasks
         WHERE assigned_to = ? AND status != 'done'
           AND due_date IS NOT NULL
           AND due_date BETWEEN CURDATE() AND DATE_ADD(NOW(), INTERVAL ? HOUR)`,
        [userId, withinHours]
    );
    return rows;
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateTask = async (id, fields) => {
    const { title, description, priority, due_date, assigned_to } = fields;
    await db.query(
        `UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, assigned_to = ? WHERE id = ?`,
        [title, description || null, priority, due_date || null, assigned_to, id]
    );
};

const updateStatus = async (id, status) => {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
};

const delegateTask = async (taskId, newAssigneeId, parentTaskId) => {
    // Create a new child task linked via parent_task_id
    const [parentTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!parentTask[0]) return null;

    const parent = parentTask[0];
    const [result] = await db.query(
        `INSERT INTO tasks (title, description, priority, assigned_by, assigned_to, parent_task_id, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [parent.title, parent.description, parent.priority, parent.assigned_to, newAssigneeId, taskId, parent.due_date]
    );
    return result.insertId;
};

const splitTask = async (taskId, subtasks) => {
    const [parentTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!parentTask[0]) return [];

    const parent = parentTask[0];
    const childIds = [];

    for (const sub of subtasks) {
        const [result] = await db.query(
            `INSERT INTO tasks (title, description, priority, assigned_by, assigned_to, parent_task_id, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sub.title, parent.description, parent.priority, parent.assigned_to, sub.assigned_to, taskId, parent.due_date]
        );
        childIds.push(result.insertId);
    }
    return childIds;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

const deleteTask = async (id) => {
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
};

/**
 * Bulk delete tasks — only deletes tasks where assigned_by = userId.
 * Returns { deleted: number, skipped: number }
 */
const bulkDeleteTasks = async (ids, userId) => {
    if (!ids || ids.length === 0) return { deleted: 0, skipped: 0 };

    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.query(
        `DELETE FROM tasks WHERE id IN (${placeholders}) AND assigned_by = ?`,
        [...ids, userId]
    );
    const deleted = result.affectedRows;
    const skipped = ids.length - deleted;
    return { deleted, skipped };
};

module.exports = {
    createTask,
    getTaskById,
    getTasksForUser,
    getSubTasks,
    getTaskCountByUser,
    getTasksDueSoon,
    updateTask,
    updateStatus,
    delegateTask,
    splitTask,
    deleteTask,
    bulkDeleteTasks,
};
