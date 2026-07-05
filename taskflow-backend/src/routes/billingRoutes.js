const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

// =============================================================================
// DISABLED — Razorpay billing kept for reference / portfolio purposes.
// All endpoints return 503 Service Unavailable.
// =============================================================================

const demoDisabledMiddleware = (req, res) => {
    res.status(503).json({ disabled: true, message: "Billing is disabled in demo mode." });
};

router.post('/razorpay-webhook', demoDisabledMiddleware);
router.use(authenticate);
router.post('/create-checkout-session', demoDisabledMiddleware);
router.post('/create-subscription', demoDisabledMiddleware);
router.post('/verify-payment', demoDisabledMiddleware);
router.post('/cancel-subscription', demoDisabledMiddleware);
router.get('/plan-status', demoDisabledMiddleware);
router.get('/verify-session', demoDisabledMiddleware);

/*
// ── ORIGINAL ROUTES ────────────────────────────────────────────────────────
router.post('/razorpay-webhook', billingController.razorpayWebhook);
router.use(authenticate);
router.post('/create-checkout-session', billingController.createCheckoutSession);
router.post('/create-subscription', billingController.createSubscription);
router.post('/verify-payment', billingController.verifyPayment);
router.post('/cancel-subscription', billingController.cancelSubscription);
router.get('/plan-status', billingController.getPlanStatus);
router.get('/verify-session', billingController.verifySession);
*/

module.exports = router;
