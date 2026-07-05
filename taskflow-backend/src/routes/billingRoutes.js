const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

// ── Razorpay Webhook (unauthenticated, verified via signature) ───────────────
router.post('/razorpay-webhook', billingController.razorpayWebhook);

// ── Authenticated billing endpoints ─────────────────────────────────────────
router.use(authenticate);

// Create checkout session / subscription
router.post('/create-checkout-session', billingController.createCheckoutSession);
router.post('/create-subscription', billingController.createSubscription);

// Verify payment after Razorpay checkout success
router.post('/verify-payment', billingController.verifyPayment);

// Cancel subscription
router.post('/cancel-subscription', billingController.cancelSubscription);

// Get plan status
router.get('/plan-status', billingController.getPlanStatus);

// Legacy compat
router.get('/verify-session', billingController.verifySession);

module.exports = router;
