const db = require('../utils/db');
const taskModel = require('./taskModel');

const createTeam = async (name, createdBy) => {
    // Generate a secure 6-character alphanumeric code
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let joinCode = '';
    for (let i = 0; i < 6; i++) joinCode += char.charAt(Math.floor(Math.random() * char.length));

    const [teamRes] = await db.query(
        `INSERT INTO teams (name, join_code, created_by) VALUES (?, ?, ?)`,
        [name, joinCode, createdBy]
    );
    const teamId = teamRes.insertId;

    // Add creator as admin
    await db.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'admin')`,
        [teamId, createdBy]
    );

    return { id: teamId, name, joinCode, role: 'admin' };
};

const joinTeam = async (userId, joinCode) => {
    const [teams] = await db.query(`SELECT team_id, name FROM teams WHERE join_code = ?`, [joinCode]);
    if (teams.length === 0) throw new Error('Invalid join code.');

    const team = teams[0];

    // Check if already member
    const [existing] = await db.query(`SELECT * FROM team_members WHERE team_id = ? AND user_id = ?`, [team.team_id, userId]);
    if (existing.length > 0) throw new Error('You are already a member of this team.');

    await db.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'member')`,
        [team.team_id, userId]
    );

    return team;
};

const getUserTeams = async (userId) => {
    const [rows] = await db.query(
        `SELECT t.team_id AS id, t.name, t.join_code, tm.role, tm.joined_at
         FROM teams t
         JOIN team_members tm ON t.team_id = tm.team_id
         WHERE tm.user_id = ?
         ORDER BY t.created_at DESC`, [userId]
    );
    return rows;
};

const getTeamMembers = async (userId) => {
    // Return all users who share ANY team with the current user, or just return members grouped by team.
    // Simplifying: return all distinct users in all teams the current user belongs to.
    const [rows] = await db.query(
        `SELECT DISTINCT u.id, u.name, u.email, u.avatar_initials, u.avatar_url, u.is_online, u.created_at
         FROM users u
         JOIN team_members tm1 ON u.id = tm1.user_id
         JOIN team_members tm2 ON tm1.team_id = tm2.team_id
         WHERE tm2.user_id = ?
         ORDER BY u.name ASC`, [userId]
    );

    // If a user has no teams, they should at least see themselves (for personal tasks)
    if (rows.length === 0) {
        const [self] = await db.query(
            `SELECT id, name, email, avatar_initials, avatar_url, is_online, created_at FROM users WHERE id = ?`, [userId]
        );
        return self;
    }

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

module.exports = { createTeam, joinTeam, getUserTeams, getTeamMembers, getUserActivity };
