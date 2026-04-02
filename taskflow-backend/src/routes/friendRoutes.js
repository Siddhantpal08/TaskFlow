const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', friendController.getFriendsAndRequests);
router.post('/request', friendController.sendRequest);
router.post('/accept', friendController.acceptRequest);
router.delete('/:friendshipId', friendController.removeFriend);

module.exports = router;
