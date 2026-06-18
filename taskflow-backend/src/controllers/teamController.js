const asyncWrapper = require('../utils/asyncWrapper');
const teamModel = require('../models/teamModel');
const userModel = require('../models/userModel');
const taskModel = require('../models/taskModel');
const { AppError } = require('../middleware/errorHandler');

const createTeam = asyncWrapper(async (req, res) => {
    const { name } = req.body;
    if (!name) throw new AppError('Team name is required.', 400);
    const team = await teamModel.createTeam(name, req.user.id);
    res.status(201).json({ success: true, data: team });
});

const joinTeam = asyncWrapper(async (req, res) => {
    const { code } = req.body;
    if (!code) throw new AppError('Join code is required.', 400);
    const team = await teamModel.joinTeam(req.user.id, code);

    const notificationService = require('../services/notificationService');
    const { emitToUser } = require('../utils/socket');

    // Fetch ALL members AFTER joining (includes the new member)
    const members = await teamModel.getMembersOfTeam(team.id);
    const joinedUser = await userModel.getUserById(req.user.id);

    for (const member of members) {
        if (member.id !== req.user.id) {
            // Notify everyone else that a new member joined
            await notificationService.sendNotification(
                member.id,
                'team_joined',
                `${joinedUser.name} joined the team "${team.name}"`,
                team.id
            );
        }
        // Emit team:refresh to ALL members (including the joiner) so everyone's member list updates
        emitToUser(String(member.id), 'team:refresh', { teamId: team.id, teamName: team.name });
    }

    // Notify the joiner themselves — welcome message in their notification panel
    const selfNotif = {
        id: `local_join_${Date.now()}`,
        type: 'team_joined_self',
        message: `You successfully joined the team "${team.name}"! 🎉`,
        is_read: false,
        created_at: new Date().toISOString(),
    };
    await notificationService.sendNotification(
        req.user.id,
        'team_joined_self',
        selfNotif.message,
        team.id
    );
    emitToUser(String(req.user.id), 'notification:new', selfNotif);

    res.status(200).json({ success: true, data: team });
});

const getMyTeams = asyncWrapper(async (req, res) => {
    const teams = await teamModel.getUserTeams(req.user.id);
    res.status(200).json({ success: true, data: teams });
});

const getTeamDetails = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const userTeams = await teamModel.getUserTeams(req.user.id);
    const isMember = userTeams.some(t => t.id === teamId);
    if (!isMember) throw new AppError('You are not a member of this team.', 403);
    const members = await teamModel.getMembersOfTeam(teamId);
    res.status(200).json({ success: true, data: members });
});

const leaveTeam = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);

    // Fetch team info and all members BEFORE any modification
    const userTeams = await teamModel.getUserTeams(req.user.id);
    const team = userTeams.find(t => t.id === teamId);
    if (!team) throw new AppError('You are not a member of this team.', 403);
    const isAdmin = team.role === 'admin';

    // Gather admins before any DB modification (so we can notify them)
    const allMembers = await teamModel.getMembersOfTeam(teamId);
    const admins = allMembers.filter(m => m.role === 'admin');

    // This inserts a leave request row for non-admins, or removes admin directly
    try {
        await teamModel.leaveTeam(req.user.id, teamId);
    } catch (modelErr) {
        // Handle 'already pending' gracefully so client gets a 400, not a 500
        if (modelErr.message && modelErr.message.includes('already pending')) {
            throw new AppError('A leave request is already pending for this team.', 400);
        }
        throw modelErr;
    }

    // If member (not admin): notify all admins about the leave request
    if (!isAdmin) {
        const notificationService = require('../services/notificationService');
        const { emitToUser } = require('../utils/socket');
        const requestingUser = await userModel.getUserById(req.user.id);
        for (const admin of admins) {
            await notificationService.sendNotification(
                admin.id,
                'leave_request',
                `${requestingUser.name} has requested to leave the team "${team.name}"`,
                teamId
            );
            emitToUser(String(admin.id), 'team:leave_request', {
                teamId, teamName: team.name, userName: requestingUser.name
            });
        }
    }

    res.status(200).json({
        success: true,
        message: isAdmin ? 'Left team successfully' : 'Leave request submitted. Waiting for admin approval.'
    });
});

const deleteTeam = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const notificationService = require('../services/notificationService');
    const { emitToUser } = require('../utils/socket');
    const db = require('../utils/db');

    // Get team + members BEFORE deletion
    const userTeams = await teamModel.getUserTeams(req.user.id);
    const team = userTeams.find(t => t.id === teamId);
    if (!team) throw new AppError('Team not found or you are not the admin.', 403);
    const teamName = team.name;
    const members = await teamModel.getMembersOfTeam(teamId);
    const memberIds = members.map(m => m.id);

    // Delete ALL tasks where BOTH creator AND assignee are members of this team
    // This covers: tasks assigned within the team in any direction
    if (memberIds.length > 0) {
        const ph = memberIds.map(() => '?').join(',');
        await db.query(
            `DELETE FROM tasks WHERE assigned_to IN (${ph}) AND assigned_by IN (${ph})`,
            [...memberIds, ...memberIds]
        );
    }

    // Delete the team (FK cascade removes team_members rows)
    await teamModel.deleteTeam(req.user.id, teamId);

    // Notify all non-admin members and emit real-time event to EVERYONE
    for (const member of members) {
        if (member.id !== req.user.id) {
            await notificationService.sendNotification(
                member.id,
                'team_removed',
                `The team "${teamName}" has been deleted by the admin.`,
                null
            );
        }
        // Emit to everyone (including the admin who deleted) so all UIs clear state
        emitToUser(String(member.id), 'team:deleted', { teamId, teamName });
    }

    res.status(200).json({ success: true, message: 'Team deleted successfully' });
});

const getLeaveRequests = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const requests = await teamModel.getLeaveRequests(teamId);
    // Return flat array — clients read res.data directly
    res.status(200).json({ success: true, data: requests });
});

const approveLeaveRequest = asyncWrapper(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const notificationService = require('../services/notificationService');
    const { emitToUser } = require('../utils/socket');
    const db = require('../utils/db');

    const [reqRows] = await db.query(
        `SELECT team_id, user_id FROM team_leave_requests WHERE id = ?`, [requestId]
    );
    if (!reqRows.length) throw new AppError('Request not found', 404);
    const { team_id, user_id } = reqRows[0];

    await teamModel.approveLeaveRequest(requestId);

    // Notify the member their leave was approved
    await notificationService.sendNotification(
        user_id,
        'leave_approved',
        `Your request to leave the team has been approved.`,
        team_id
    );
    emitToUser(String(user_id), 'team:member_removed', { teamId: team_id });

    res.status(200).json({ success: true, message: 'Leave request approved' });
});

const rejectLeaveRequest = asyncWrapper(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    const notificationService = require('../services/notificationService');
    const db = require('../utils/db');

    const [reqRows] = await db.query(
        `SELECT team_id, user_id FROM team_leave_requests WHERE id = ?`, [requestId]
    );
    if (reqRows.length) {
        const { user_id, team_id } = reqRows[0];
        await notificationService.sendNotification(
            user_id,
            'leave_rejected',
            `Your request to leave the team has been rejected by the admin.`,
            team_id
        );
    }

    await teamModel.rejectLeaveRequest(requestId);
    res.status(200).json({ success: true, message: 'Leave request rejected' });
});

const getMembers = asyncWrapper(async (req, res) => {
    const members = await teamModel.getTeamMembers(req.user.id);
    res.status(200).json({ success: true, data: members });
});

const getMemberActivity = asyncWrapper(async (req, res) => {
    const memberId = parseInt(req.params.id, 10);
    const member = await userModel.getUserById(memberId);
    if (!member) throw new AppError('User not found.', 404);
    const activity = await teamModel.getUserActivity(memberId);
    res.status(200).json({ success: true, data: { member, activity } });
});

const getDummyHierarchy = asyncWrapper(async (req, res) => {
    const tasks = await taskModel.getTasksForUser(req.user.id);
    const currentUser = await userModel.getUserById(req.user.id);

    const seenIds = new Set(tasks.map(t => t.id));
    const allTasks = [...tasks];

    const fetchParentChain = async (parentId) => {
        if (!parentId || seenIds.has(parentId)) return;
        const parent = await taskModel.getTaskById(parentId);
        if (!parent) return;
        seenIds.add(parent.id);
        allTasks.push(parent);
        if (parent.parent_task_id) await fetchParentChain(parent.parent_task_id);
    };

    for (const t of tasks) {
        if (t.parent_task_id && !seenIds.has(t.parent_task_id)) {
            await fetchParentChain(t.parent_task_id);
        }
    }

    const fetchChildren = async (parentId) => {
        const children = await taskModel.getSubTasks(parentId);
        for (const child of children) {
            if (!seenIds.has(child.id)) {
                seenIds.add(child.id);
                const fullChild = await taskModel.getTaskById(child.id);
                if (fullChild) allTasks.push(fullChild);
                await fetchChildren(child.id);
            }
        }
    };

    for (const t of [...tasks]) {
        await fetchChildren(t.id);
    }

    const map = {};
    const rootNodes = [];

    allTasks.forEach(t => {
        map[t.id] = {
            id: `t_${t.id}`,
            title: t.title,
            status: t.status,
            assignee: { name: t.assigned_to_name || 'Unassigned', initials: t.assigned_to_initials || '?' },
            children: [],
            parent_task_id: t.parent_task_id
        };
    });

    allTasks.forEach(t => {
        if (t.parent_task_id && map[t.parent_task_id]) {
            map[t.parent_task_id].children.push(map[t.id]);
        } else {
            rootNodes.push(map[t.id]);
        }
    });

    const dummyTree = {
        id: 't_root_org',
        title: 'Project Delegation Network',
        status: 'done',
        assignee: { name: currentUser?.name || 'You', initials: currentUser?.avatar_initials || '?' },
        children: rootNodes
    };
    res.status(200).json({ success: true, data: dummyTree });
});

const removeMember = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const memberId = parseInt(req.params.memberId, 10);

    const members = await teamModel.getMembersOfTeam(teamId);
    const requester = members.find(m => m.id === req.user.id);
    if (!requester || requester.role !== 'admin') {
        throw new AppError('Only an admin can remove members.', 403);
    }

    const userTeams = await teamModel.getUserTeams(req.user.id);
    const team = userTeams.find(t => t.id === teamId);
    const teamName = team?.name || 'a team';

    await teamModel.removeMember(teamId, memberId);

    const notificationService = require('../services/notificationService');
    const { emitToUser } = require('../utils/socket');

    // Notify removed member
    await notificationService.sendNotification(
        memberId,
        'team_removed',
        `You have been removed from the team "${teamName}" by an admin.`,
        teamId
    );
    emitToUser(String(memberId), 'team:member_removed', { teamId, teamName });

    // Emit team:refresh to all remaining members so their lists update
    for (const member of members) {
        if (member.id !== memberId) {
            emitToUser(String(member.id), 'team:refresh', { teamId, teamName });
        }
    }

    res.status(200).json({ success: true, message: 'Member removed successfully' });
});

module.exports = {
    createTeam, joinTeam, getMyTeams, getTeamDetails, leaveTeam, deleteTeam,
    getLeaveRequests, approveLeaveRequest, rejectLeaveRequest,
    getMembers, getMemberActivity, getDummyHierarchy, removeMember
};
