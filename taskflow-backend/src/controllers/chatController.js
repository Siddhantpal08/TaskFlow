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

const deleteTeamMessage = asyncWrapper(async (req, res) => {
    const messageId = parseInt(req.params.messageId, 10);
    const msg = await chatModel.getMessageById(messageId);
    if (!msg) {
        throw new AppError('Message not found.', 404);
    }

    const teamId = msg.team_id;
    const members = await teamModel.getMembersOfTeam(teamId);
    const member = members.find(m => m.id === req.user.id);
    if (!member) {
        throw new AppError('You are not a member of this team.', 403);
    }

    // Allow sender OR team admin to delete
    const isSender = msg.user_id === req.user.id;
    const isAdmin = member.role === 'admin';
    if (!isSender && !isAdmin) {
        throw new AppError('You do not have permission to delete this message.', 403);
    }

    await chatModel.deleteMessage(messageId);

    // Broadcast deletion
    for (const mem of members) {
        emitToUser(String(mem.id), 'chat:message_deleted', { id: messageId, team_id: teamId });
    }

    res.status(200).json({ success: true, data: { id: messageId } });
});

module.exports = { getTeamMessages, sendTeamMessage, deleteTeamMessage };
