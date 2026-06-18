const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getTeamMessages, sendTeamMessage } = require('../controllers/chatController');

const router = express.Router();

router.use(authenticate);

router.get('/:teamId', getTeamMessages);
router.post('/:teamId', sendTeamMessage);

module.exports = router;
