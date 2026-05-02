const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createTeam, joinTeam, getMyTeams, getTeamDetails, leaveTeam, getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, getMembers, getMemberActivity, getDummyHierarchy, removeMember } = require('../controllers/teamController');

const router = express.Router();

router.use(authenticate);

// Create or join teams
router.post('/', createTeam);
router.post('/join', joinTeam);

// List user's teams
router.get('/', getMyTeams);

// Get specific team members
router.get('/:id/members', getTeamDetails);

// Leave a team
router.delete('/:id/leave', leaveTeam);

// Remove a member (admin only)
router.delete('/:teamId/members/:memberId', removeMember);

// Leave Requests
router.get('/:id/leave-requests', getLeaveRequests);
router.post('/leave-requests/:id/approve', approveLeaveRequest);
router.post('/leave-requests/:id/reject', rejectLeaveRequest);

// List members shared with user
router.get('/members', getMembers);

// Get activity of a specific member
router.get('/members/:id/activity', getMemberActivity);

// Dummy organizational hierarchy
router.get('/hierarchy/dummy', getDummyHierarchy);

module.exports = router;
