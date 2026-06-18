const asyncWrapper = require('../utils/asyncWrapper');
const chatModel = require('../models/chatModel');
const teamModel = require('../models/teamModel');
const { AppError } = require('../middleware/errorHandler');
const { emitToUser } = require('../utils/socket');

const getTeamMessages = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.teamId, 10);
    // verify user is in team
    const members = await teamModel.getMembersOfTeam(teamId);
    if (!members.find(m => m.id === req.user.id)) {
        throw new AppError('You are not a member of this team.', 403);
    }
    
    const messages = await chatModel.getMessages(teamId, 50);
    res.status(200).json({ success: true, data: messages });
});

const sendTeamMessage = asyncWrapper(async (req, res) => {
    const teamId = parseInt(req.params.teamId, 10);
    const { message } = req.body;
    
    if (!message || !message.trim()) {
        throw new AppError('Message is required', 400);
    }

    const members = await teamModel.getMembersOfTeam(teamId);
    if (!members.find(m => m.id === req.user.id)) {
        throw new AppError('You are not a member of this team.', 403);
    }

    const msg = await chatModel.saveMessage(teamId, req.user.id, message);
    
    // Attach sender info
    const sender = members.find(m => m.id === req.user.id);
    msg.sender_name = sender.name;
    msg.sender_initials = sender.avatar_initials;
    msg.sender_avatar = sender.avatar_url;

    // Broadcast to all team members
    for (const mem of members) {
        emitToUser(String(mem.id), 'chat:message', msg);
    }

    res.status(201).json({ success: true, data: msg });
});

module.exports = { getTeamMessages, sendTeamMessage };
