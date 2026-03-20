const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createTeam, joinTeam, getMyTeams, getMembers, getMemberActivity } = require('../controllers/teamController');

const router = express.Router();

router.use(authenticate);

// Create or join teams
router.post('/', createTeam);
router.post('/join', joinTeam);

// List user's teams
router.get('/', getMyTeams);

// List members shared with user
router.get('/members', getMembers);

// Get activity of a specific member
router.get('/members/:id/activity', getMemberActivity);

module.exports = router;
