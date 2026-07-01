const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { submitFeedback, getFeedback, submitTicket } = require('../controllers/feedbackController');

router.use(authenticate);
router.post('/', submitFeedback);
router.get('/', getFeedback); // admin only
router.post('/tickets', submitTicket);

module.exports = router;
