const express = require('express');
const { authenticate } = require('../middleware/auth');
const { listTeamMembers, getMemberActivity } = require('../controllers/teamController');

const router = express.Router();

router.use(authenticate);

router.get('/', listTeamMembers);
router.get('/:id/activity', getMemberActivity);

module.exports = router;
