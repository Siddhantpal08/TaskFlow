const express = require('express');
const { authenticate } = require('../middleware/auth');
const { listNotifications, markAllRead, markOneRead, clearAll } = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);

router.get('/', listNotifications);
router.delete('/all', clearAll);
router.patch('/read-all', markAllRead);        // must be before /:id/read
router.patch('/:id/read', markOneRead);

module.exports = router;
