const asyncWrapper = require('../utils/asyncWrapper');
const db = require('../utils/db');
const { AppError } = require('../middleware/errorHandler');

// Initialize Stripe gracefully
const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeKey) {
    try {
        stripe = require('stripe')(stripeKey);
        console.log('[STRIPE] Stripe initialized successfully.');
    } catch (err) {
        console.error('[STRIPE] Initialization failed:', err.message);
    }
} else {
    console.warn('[STRIPE] Warning: STRIPE_SECRET_KEY is not defined in .env. Running in SANDBOX MOCK mode.');
}

/**
 * POST /api/v1/billing/create-checkout-session
 * Creates a Stripe Checkout Session for subscription upgrade.
 */
const createCheckoutSession = asyncWrapper(async (req, res) => {
    const { billing } = req.body; // 'monthly' | 'yearly'
    const userId = req.user.id;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 1. If Stripe is not configured, run in sandbox mock mode
    if (!stripe) {
        const mockSessionUrl = `${clientUrl}/?session_id=mock_sub_${Date.now()}_${userId}&payment=success&billing=${billing}`;
        return res.json({
            success: true,
            mock: true,
            url: mockSessionUrl,
            message: 'Running in Stripe Sandbox Mode. Redirecting to mock session...'
        });
    }

    // 2. Real Stripe mode
    const isYearly = billing === 'yearly';
    const priceId = isYearly 
        ? (process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder')
        : (process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder');

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: req.user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${clientUrl}/?session_id={CHECKOUT_SESSION_ID}&payment=success`,
            cancel_url: `${clientUrl}/?payment=cancel`,
            metadata: {
                userId: String(userId),
                billing
            }
        });

        res.json({
            success: true,
            mock: false,
            url: session.url,
            sessionId: session.id
        });
    } catch (error) {
        console.error('[STRIPE] Create Session error:', error.message);
        throw new AppError(error.message || 'Failed to create checkout session.', 500);
    }
});

/**
 * GET /api/v1/billing/verify-session
 * Verifies the Stripe session after user redirects back.
 */
const verifySession = asyncWrapper(async (req, res) => {
    const { session_id } = req.query;
    const userId = req.user.id;

    if (!session_id) {
        throw new AppError('Session ID is required.', 400);
    }

    let isPaid = false;
    let billing = 'monthly';

    // 1. Handle mock session verification
    if (session_id.startsWith('mock_sub_')) {
        isPaid = true;
        billing = session_id.includes('yearly') ? 'yearly' : 'monthly';
    } 
    // 2. Handle real Stripe session verification
    else if (stripe) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status === 'paid') {
                isPaid = true;
                billing = session.metadata.billing || 'monthly';
            }
        } catch (error) {
            console.error('[STRIPE] Session retrieval error:', error.message);
            throw new AppError('Failed to verify payment session with Stripe.', 400);
        }
    } else {
        throw new AppError('Stripe configuration missing, unable to verify real session.', 500);
    }

    if (isPaid) {
        const expiresAt = new Date();
        if (billing === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Upgrade user plan
        await db.query(
            "UPDATE users SET plan = 'pro', plan_expires_at = ? WHERE id = ?",
            [expiresAt, userId]
        );

        console.log(`[BILLING] User #${userId} successfully upgraded to PRO (Billing: ${billing}, Expires: ${expiresAt.toISOString().split('T')[0]})`);

        return res.json({
            success: true,
            plan: 'pro',
            expiresAt: expiresAt.toISOString().split('T')[0],
            message: 'Your account has been successfully upgraded to PRO!'
        });
    }

    res.json({
        success: false,
        message: 'Payment verification pending or failed.'
    });
});

module.exports = {
    createCheckoutSession,
    verifySession
};
