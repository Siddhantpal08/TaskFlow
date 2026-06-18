const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');

router.use(authenticate);
router.post('/', submitFeedback);
router.get('/', getFeedback); // admin only

module.exports = router;
