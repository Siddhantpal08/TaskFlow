const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

// LemonSqueezy webhook endpoint (unauthenticated, checked via signature)
router.post('/lemonsqueezy-webhook', billingController.lemonsqueezyWebhook);

// All other billing endpoints require auth
router.use(authenticate);

// Checkout Session Creation
router.post('/create-checkout-session', billingController.createCheckoutSession);

// Client-side verification fallback
router.get('/verify-session', billingController.verifySession);

module.exports = router;
