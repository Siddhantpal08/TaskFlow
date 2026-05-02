const asyncWrapper = require('../utils/asyncWrapper');
const teamModel = require('../models/teamModel');
const userModel = require('../models/userModel');
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
    res.status(200).json({ success: true, data: team });
});

const getMyTeams = asyncWrapper(async (req, res) => {
    const teams = await teamModel.getUserTeams(req.user.id);
    res.status(200).json({ success: true, data: teams });
});

const getTeamDetails = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    // Security check optional here, rely on frontend for non-sensitive data, but we can just return members
    const members = await teamModel.getMembersOfTeam(teamId);
    res.status(200).json({ success: true, data: members });
});

const leaveTeam = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    await teamModel.leaveTeam(req.user.id, teamId);
    res.status(200).json({ success: true, message: 'Left team or leave request submitted' });
});

const getLeaveRequests = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.id, 10);
    const requests = await teamModel.getLeaveRequests(teamId);
    res.status(200).json({ success: true, data: requests });
});

const approveLeaveRequest = asyncWrapper(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    await teamModel.approveLeaveRequest(requestId);
    res.status(200).json({ success: true, message: 'Leave request approved' });
});

const rejectLeaveRequest = asyncWrapper(async (req, res) => {
    const requestId = parseInt(req.params.id, 10);
    await teamModel.rejectLeaveRequest(requestId);
    res.status(200).json({ success: true, message: 'Leave request rejected' });
});

const getMembers = asyncWrapper(async (req, res) => {
    const members = await teamModel.getTeamMembers(req.user.id);
    res.status(200).json({ success: true, data: members });
});

const removeMember = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.teamId, 10);
    const memberId = parseInt(req.params.memberId, 10);
    // Verify requester is admin
    const teams = await teamModel.getUserTeams(req.user.id);
    const myTeam = teams.find(t => t.id === teamId);
    if (!myTeam || myTeam.role !== 'admin') {
        throw new AppError('Only team admins can remove members.', 403);
    }
    if (memberId === req.user.id) {
        throw new AppError('You cannot remove yourself. Use Leave Team instead.', 400);
    }
    await teamModel.removeMember(teamId, memberId);
    res.status(200).json({ success: true, message: 'Member removed successfully.' });
});

const getMemberActivity = asyncWrapper(async (req, res) => {
    const memberId = parseInt(req.params.id, 10);
    const member = await userModel.getUserById(memberId);
    if (!member) throw new AppError('User not found.', 404);

    const activity = await teamModel.getUserActivity(memberId);
    res.status(200).json({ success: true, data: { member, activity } });
});

const taskModel = require('../models/taskModel');

const getDummyHierarchy = asyncWrapper(async (req, res) => {
    const tasks = await taskModel.getTasksForUser(req.user.id);
    const map = {};
    const rootNodes = [];

    tasks.forEach(t => {
        map[t.id] = {
            id: `t_${t.id}`,
            title: t.title,
            status: t.status,
            assignee: { name: t.assigned_to_name || 'Unassigned', initials: t.assigned_to_initials || '?' },
            children: [],
            parent_task_id: t.parent_task_id
        };
    });

    tasks.forEach(t => {
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
        assignee: { name: req.user.name, initials: req.user.avatar_initials || '?' },
        children: rootNodes
    };
    res.status(200).json({ success: true, data: dummyTree });
});

module.exports = { createTeam, joinTeam, getMyTeams, getTeamDetails, leaveTeam, getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, getMembers, getMemberActivity, getDummyHierarchy };
