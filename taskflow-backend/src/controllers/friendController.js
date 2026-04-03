const friendModel = require('../models/friendModel');
const userModel = require('../models/userModel');
const { sendNotification } = require('../services/notificationService');

const sendRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;

        if (!email) return res.status(400).json({ status: 'fail', message: 'Email is required' });

        const recipient = await userModel.getUserByEmail(email);
        if (!recipient) return res.status(404).json({ status: 'fail', message: 'User not found with this email' });

        if (recipient.id === userId) return res.status(400).json({ status: 'fail', message: 'Cannot friend yourself' });

        await friendModel.sendRequest(userId, recipient.id);

        // Notify the recipient in real-time
        const senderName = req.user.name || 'Someone';
        sendNotification(
            recipient.id,
            'friend_request',
            `${senderName} sent you a friend request`
        ).catch(() => { });

        res.status(200).json({ status: 'success', message: 'Friend request sent' });
    } catch (e) {
        if (e.message.includes('already')) {
            return res.status(400).json({ status: 'fail', message: e.message });
        }
        next(e);
    }
};

const acceptRequest = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.body;

        const result = await friendModel.acceptRequest(requestId, userId);

        // Notify the original requester in real-time
        const accepterName = req.user.name || 'Someone';
        if (result?.requester_id) {
            sendNotification(
                result.requester_id,
                'friend_accepted',
                `${accepterName} accepted your friend request`
            ).catch(() => { });
        }

        res.status(200).json({ status: 'success', message: 'Friend request accepted' });
    } catch (e) {
        next(e);
    }
};

const getFriendsAndRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const friends = await friendModel.getFriends(userId);
        const requests = await friendModel.getPendingRequests(userId);

        res.status(200).json({ status: 'success', data: { friends, requests } });
    } catch (e) {
        next(e);
    }
};

const removeFriend = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { friendshipId } = req.params;

        await friendModel.removeFriendOrRequest(friendshipId, userId);
        res.status(200).json({ status: 'success', message: 'Friend removed' });
    } catch (e) {
        next(e);
    }
};

module.exports = {
    sendRequest,
    acceptRequest,
    getFriendsAndRequests,
    removeFriend
};

