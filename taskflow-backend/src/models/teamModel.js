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
    const [teams] = await db.query(`SELECT team_id, name, join_code FROM teams WHERE join_code = ?`, [joinCode]);
    if (teams.length === 0) throw new Error('Invalid join code.');

    const team = teams[0];

    // Check if already member
    const [existing] = await db.query(`SELECT * FROM team_members WHERE team_id = ? AND user_id = ?`, [team.team_id, userId]);
    if (existing.length > 0) throw new Error('You are already a member of this team.');

    await db.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'member')`,
        [team.team_id, userId]
    );

    // Return shape consistent with getUserTeams: { id, name, join_code, role }
    return { id: team.team_id, name: team.name, join_code: team.join_code, role: 'member' };
};

const leaveTeam = async (userId, teamId) => {
    // Check if user is an admin. If they are the ONLY admin, they shouldn't just leave, 
    // but for now, the user requested an approval to leave. So only members request leave.
    const [member] = await db.query(`SELECT role FROM team_members WHERE user_id = ? AND team_id = ?`, [userId, teamId]);
    if (!member.length) throw new Error('Not a member of this team');

    if (member[0].role === 'admin') {
        // Admins can just leave or delete the team if no one is left
        await db.query(`DELETE FROM team_members WHERE user_id = ? AND team_id = ?`, [userId, teamId]);
        const [remaining] = await db.query(`SELECT COUNT(*) as count FROM team_members WHERE team_id = ?`, [teamId]);
        if (remaining[0].count === 0) {
            await db.query(`DELETE FROM teams WHERE team_id = ?`, [teamId]);
        }
    } else {
        // Members must request to leave
        const [existingReq] = await db.query(`SELECT id FROM team_leave_requests WHERE user_id = ? AND team_id = ? AND status = 'pending'`, [userId, teamId]);
        if (existingReq.length > 0) throw new Error('A leave request is already pending.');

        await db.query(`INSERT INTO team_leave_requests (team_id, user_id, status) VALUES (?, ?, 'pending')`, [teamId, userId]);
    }
};

const deleteTeam = async (userId, teamId) => {
    const [member] = await db.query(`SELECT role FROM team_members WHERE user_id = ? AND team_id = ?`, [userId, teamId]);
    if (!member.length || member[0].role !== 'admin') throw new Error('Only an admin can delete the team');
    
    await db.query(`DELETE FROM teams WHERE team_id = ?`, [teamId]);
};

const getLeaveRequests = async (teamId) => {
    const [rows] = await db.query(
        `SELECT r.id, r.user_id, r.status, r.created_at, u.name, u.email, u.avatar_initials
         FROM team_leave_requests r
         JOIN users u ON u.id = r.user_id
         WHERE r.team_id = ? AND r.status = 'pending'
         ORDER BY r.created_at DESC`, [teamId]
    );
    return rows;
};

const approveLeaveRequest = async (requestId) => {
    const [reqRow] = await db.query(`SELECT team_id, user_id FROM team_leave_requests WHERE id = ?`, [requestId]);
    if (!reqRow.length) throw new Error('Request not found');

    // Update request status
    await db.query(`UPDATE team_leave_requests SET status = 'approved' WHERE id = ?`, [requestId]);

    // Remove from team_members
    await db.query(`DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [reqRow[0].team_id, reqRow[0].user_id]);
};

const rejectLeaveRequest = async (requestId) => {
    await db.query(`UPDATE team_leave_requests SET status = 'rejected' WHERE id = ?`, [requestId]);
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

const getMembersOfTeam = async (teamId) => {
    const [rows] = await db.query(
        `SELECT u.id, u.name, u.email, u.avatar_initials, u.avatar_url, tm.role, tm.joined_at
         FROM users u
         JOIN team_members tm ON u.id = tm.user_id
         WHERE tm.team_id = ?
         ORDER BY FIELD(tm.role, 'admin', 'member'), u.name ASC`, [teamId]
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

module.exports = { createTeam, joinTeam, leaveTeam, deleteTeam, getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, getUserTeams, getTeamMembers, getMembersOfTeam, getUserActivity };
