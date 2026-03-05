const asyncWrapper = require('../utils/asyncWrapper');
const teamModel = require('../models/teamModel');
const userModel = require('../models/userModel');
const { AppError } = require('../middleware/errorHandler');

/** GET /api/v1/team */
const listTeamMembers = asyncWrapper(async (req, res) => {
    const members = await teamModel.getAllTeamMembers();
    res.status(200).json({ success: true, data: members });
});

/** GET /api/v1/team/:id/activity */
const getMemberActivity = asyncWrapper(async (req, res) => {
    const memberId = parseInt(req.params.id, 10);
    const member = await userModel.getUserById(memberId);
    if (!member) throw new AppError('User not found.', 404);

    const activity = await teamModel.getUserActivity(memberId);
    res.status(200).json({ success: true, data: { member, activity } });
});

module.exports = { listTeamMembers, getMemberActivity };
