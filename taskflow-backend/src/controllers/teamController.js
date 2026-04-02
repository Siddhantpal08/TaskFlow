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

const getMemberActivity = asyncWrapper(async (req, res) => {
    const memberId = parseInt(req.params.id, 10);
    const member = await userModel.getUserById(memberId);
    if (!member) throw new AppError('User not found.', 404);

    const activity = await teamModel.getUserActivity(memberId);
    res.status(200).json({ success: true, data: { member, activity } });
});

const getDummyHierarchy = asyncWrapper(async (req, res) => {
    const dummyTree = {
        id: 't_ceo_1',
        title: 'Launch TaskFlow Q3',
        status: 'in_progress',
        assignee: { name: 'Alice (CEO)', initials: 'AL' },
        children: [
            {
                id: 't_cto_1',
                title: 'Deploy New Core Architecture',
                status: 'in_progress',
                assignee: { name: 'Bob (CTO)', initials: 'BO' },
                children: [
                    {
                        id: 't_dev_1',
                        title: 'Migrate DB Servers',
                        status: 'done',
                        assignee: { name: 'Charlie (DevLead)', initials: 'CH' },
                        children: []
                    },
                    {
                        id: 't_dev_2',
                        title: 'Implement Friends Socket Sync',
                        status: 'in_progress',
                        assignee: { name: 'Dave (Backend)', initials: 'DA' },
                        children: [
                            {
                                id: 't_dev_3',
                                title: 'Write Friend Model Specs',
                                status: 'done',
                                assignee: { name: 'Eve (Intern)', initials: 'EV' },
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 't_cmo_1',
                title: 'Market New Collaboration Feature',
                status: 'pending',
                assignee: { name: 'Fiona (CMO)', initials: 'FI' },
                children: [
                    {
                        id: 't_mar_1',
                        title: 'Draft Newsletter',
                        status: 'in_progress',
                        assignee: { name: 'George (Marketing)', initials: 'GE' },
                        children: []
                    }
                ]
            }
        ]
    };
    res.status(200).json({ success: true, data: dummyTree });
});

module.exports = { createTeam, joinTeam, getMyTeams, getTeamDetails, leaveTeam, getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, getMembers, getMemberActivity, getDummyHierarchy };
