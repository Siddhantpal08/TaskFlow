const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { submitFeedback, getFeedback, submitTicket, upvoteFeedback, getPublicFeedboard } = require('../controllers/feedbackController');

router.use(authenticate);
router.post('/', submitFeedback);
router.get('/', getFeedback);            // admin only — full list with emails
router.get('/public', getPublicFeedboard); // all users — anonymized top feedback
router.put('/:id/upvote', upvoteFeedback); // any user — upvote a feedback entry
router.post('/tickets', submitTicket);

module.exports = router;
