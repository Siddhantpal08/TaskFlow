const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { submitFeedback, getFeedback, submitTicket, upvoteFeedback, getPublicFeedboard, updateFeedbackStatus, deleteFeedback } = require('../controllers/feedbackController');

router.use(authenticate);
router.post('/', submitFeedback);
router.get('/', getFeedback);            // admin only — full list with emails
router.patch('/:id/status', updateFeedbackStatus); // admin only — update status
router.delete('/:id', deleteFeedback);   // admin only — delete feedback
router.get('/public', getPublicFeedboard); // all users — anonymized top feedback
router.put('/:id/upvote', upvoteFeedback); // any user — upvote a feedback entry
router.post('/tickets', submitTicket);

module.exports = router;
