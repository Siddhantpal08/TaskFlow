const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

// All billing endpoints require auth
router.use(authenticate);

// Stripe Checkout Session Creation
router.post('/create-checkout-session', billingController.createCheckoutSession);

// Client-side verification fallback
router.get('/verify-session', billingController.verifySession);

module.exports = router;
