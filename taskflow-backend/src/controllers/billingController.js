const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../utils/db');

// ── Razorpay client ──────────────────────────────────────────────────────────
let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
} catch (e) {
    console.error("[Razorpay] Failed to initialize:", e.message);
}

// Plan pricing (in paise — INR * 100)
const PLAN_PRICING = {
    starter: { monthly: 4900, yearly: 49900 },   // ₹49/mo, ₹499/yr
    pro:     { monthly: 9900, yearly: 100000 },  // ₹99/mo, ₹1000/yr
};

// ── Create Subscription (for recurring billing) ──────────────────────────────
exports.createSubscription = async (req, res) => {
    try {
        const { billing = 'monthly', plan = 'pro' } = req.body;
        const userId = req.user.id;

        const planId = plan === 'starter'
            ? process.env.RAZORPAY_STARTER_PLAN_ID
            : process.env.RAZORPAY_PRO_PLAN_ID;

        // If plan IDs are configured in env, create a proper subscription
        if (planId && razorpay) {
            const subscription = await razorpay.subscriptions.create({
                plan_id: planId,
                customer_notify: 1,
                total_count: billing === 'yearly' ? 1 : 12,
                notes: {
                    userId: String(userId),
                    plan,
                    billing,
                },
            });
            return res.json({
                type: 'subscription',
                subscriptionId: subscription.id,
                key: process.env.RAZORPAY_KEY_ID,
            });
        }

        if (!razorpay) {
            return res.status(500).json({ error: "Billing is not configured on this server." });
        }

        // Fallback: create a one-time order for the plan amount
        const amount = PLAN_PRICING[plan]?.[billing] || PLAN_PRICING.pro.monthly;
        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `tf_${plan}_${userId}_${Date.now()}`,
            notes: {
                userId: String(userId),
                plan,
                billing,
                type: 'subscription_upgrade',
            },
        });

        return res.json({
            type: 'order',
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('[Billing] createSubscription error:', err);
        res.status(500).json({ error: err.message || 'Failed to create checkout session' });
    }
};

// ── Verify Payment (called after Razorpay checkout success) ─────────────────
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_subscription_id,
            razorpay_signature,
            plan = 'pro',
            billing = 'monthly',
        } = req.body;

        const userId = req.user.id;
        let isValid = false;

        if (razorpay_subscription_id) {
            // Verify subscription payment
            const body = razorpay_payment_id + '|' + razorpay_subscription_id;
            const expectedSig = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');
            isValid = expectedSig === razorpay_signature;
        } else if (razorpay_order_id) {
            // Verify one-time order payment
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSig = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');
            isValid = expectedSig === razorpay_signature;
        }

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Calculate subscription end date
        const now = new Date();
        const expiresAt = new Date(now);
        if (billing === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Update user plan in DB
        await db.query(
            `UPDATE users SET plan = ?, plan_expires_at = ?, razorpay_payment_id = ?, razorpay_subscription_id = ?, updated_at = NOW() WHERE id = ?`,
            [plan, expiresAt, razorpay_payment_id, razorpay_subscription_id || null, userId]
        );

        res.json({
            success: true,
            plan,
            expiresAt,
            message: `Successfully upgraded to ${plan.toUpperCase()}!`,
        });
    } catch (err) {
        console.error('[Billing] verifyPayment error:', err);
        res.status(500).json({ error: err.message || 'Payment verification failed' });
    }
};

// ── Razorpay Webhook (server-side event handler) ─────────────────────────────
exports.razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature
        const expectedSig = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSig !== signature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log('[Billing Webhook]', event);

        if (event === 'subscription.activated' || event === 'subscription.charged') {
            const sub = payload?.subscription?.entity;
            const userId = sub?.notes?.userId;
            const plan = sub?.notes?.plan || 'pro';
            const billing = sub?.notes?.billing || 'monthly';

            if (userId) {
                const expiresAt = new Date();
                if (billing === 'yearly') {
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                } else {
                    expiresAt.setMonth(expiresAt.getMonth() + 1);
                }
                await db.query(
                    `UPDATE users SET plan = ?, plan_expires_at = ?, updated_at = NOW() WHERE id = ?`,
                    [plan, expiresAt, userId]
                );
                console.log(`[Billing] User ${userId} upgraded to ${plan}`);
            }
        }

        if (event === 'subscription.cancelled' || event === 'subscription.expired') {
            const sub = payload?.subscription?.entity;
            const userId = sub?.notes?.userId;
            if (userId) {
                await db.query(
                    `UPDATE users SET plan = 'free', plan_expires_at = NULL, updated_at = NOW() WHERE id = ?`,
                    [userId]
                );
                console.log(`[Billing] User ${userId} downgraded to free`);
            }
        }

        if (event === 'payment.failed') {
            console.warn('[Billing] Payment failed for payload:', payload?.payment?.entity?.id);
        }

        res.json({ status: 'ok' });
    } catch (err) {
        console.error('[Billing Webhook] Error:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// ── Get current plan status ──────────────────────────────────────────────────
exports.getPlanStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT plan, plan_expires_at FROM users WHERE id = ?',
            [userId]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const { plan, plan_expires_at } = rows[0];
        const isExpired = plan_expires_at && new Date(plan_expires_at) < new Date();

        res.json({
            plan: isExpired ? 'free' : (plan || 'free'),
            expiresAt: plan_expires_at,
            isExpired,
        });
    } catch (err) {
        console.error('[Billing] getPlanStatus error:', err);
        res.status(500).json({ error: 'Failed to fetch plan status' });
    }
};

// ── Cancel Subscription ────────────────────────────────────────────────────────
exports.cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            'SELECT plan, razorpay_subscription_id FROM users WHERE id = ?',
            [userId]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const { plan, razorpay_subscription_id } = rows[0];

        if (plan === 'free') {
            return res.status(400).json({ error: 'You are already on the free plan.' });
        }

        // Cancel in Razorpay if we have the ID and razorpay is configured
        if (razorpay_subscription_id && razorpay) {
            try {
                await razorpay.subscriptions.cancel(razorpay_subscription_id, false); // cancel at end of billing cycle
            } catch (rzpErr) {
                console.error('[Billing] Razorpay cancel error:', rzpErr);
                // Even if razorpay fails (e.g., already cancelled), proceed to update local DB
            }
        }

        // We do not immediately set plan = 'free' because they paid for the current cycle.
        // We will clear the razorpay_subscription_id so it doesn't renew, and Webhook will handle expiry,
        // or getPlanStatus will see it's expired once the date passes.
        // For simplicity and immediate user feedback, we will just clear the subscription ID.
        await db.query(
            `UPDATE users SET razorpay_subscription_id = NULL WHERE id = ?`,
            [userId]
        );

        res.json({ success: true, message: 'Subscription cancelled. It will not auto-renew.' });
    } catch (err) {
        console.error('[Billing] cancelSubscription error:', err);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

// ── Legacy: createCheckoutSession (kept for backward compat, redirects to createSubscription) ──
exports.createCheckoutSession = exports.createSubscription;

// ── Legacy: verifySession ────────────────────────────────────────────────────
exports.verifySession = exports.getPlanStatus;
