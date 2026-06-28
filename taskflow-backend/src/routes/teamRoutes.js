const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
    createTeam, joinTeam, getMyTeams, getTeamDetails,
    leaveTeam, deleteTeam, updateTeam,
    getLeaveRequests, approveLeaveRequest, rejectLeaveRequest,
    getMembers, getMemberActivity, getDummyHierarchy, removeMember
} = require('../controllers/teamController');

const router = express.Router();

router.use(authenticate);

// Create or join teams
router.post('/', createTeam);
router.post('/join', joinTeam);

// List user's teams
router.get('/', getMyTeams);

// Get specific team members
router.get('/:id/members', getTeamDetails);

// Update (rename) a team — admin only
router.patch('/:id', updateTeam);

// Leave a team
router.delete('/:id/leave', leaveTeam);

// Remove a member from a team
router.delete('/:id/members/:memberId', removeMember);

// Delete a team
router.delete('/:id', deleteTeam);

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
