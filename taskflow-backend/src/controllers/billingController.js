const asyncWrapper = require('../utils/asyncWrapper');
const db = require('../utils/db');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');

/**
 * POST /api/v1/billing/create-checkout-session
 * Returns LemonSqueezy checkout URL, or mock fallback.
 */
const createCheckoutSession = asyncWrapper(async (req, res) => {
    const { billing, plan = 'pro' } = req.body; // 'monthly' | 'yearly', 'starter' | 'pro'
    const userId = req.user.id;
    const clientUrl = req.get('origin') || process.env.CLIENT_URL || 'http://localhost:5173';

    // If LemonSqueezy webhook secret is not configured, run in sandbox mock mode
    if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
        const mockSessionUrl = `${clientUrl}/?session_id=mock_sub_${Date.now()}_${userId}_${plan}_${billing}&payment=success&billing=${billing}&plan=${plan}`;
        return res.json({
            success: true,
            mock: true,
            url: mockSessionUrl,
            message: 'Running in LemonSqueezy Sandbox Mode. Redirecting to mock session...'
        });
    }

    // Real LemonSqueezy mode
    const storeUrl = process.env.LEMONSQUEEZY_STORE_URL || 'https://taskflow.lemonsqueezy.com';
    let variantId = '';
    if (plan === 'starter') {
        variantId = billing === 'yearly' 
            ? (process.env.LEMONSQUEEZY_STARTER_YEARLY_VARIANT || 'variant_starter_yearly_placeholder')
            : (process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT || 'variant_starter_monthly_placeholder');
    } else {
        variantId = billing === 'yearly' 
            ? (process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT || 'variant_pro_yearly_placeholder')
            : (process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT || 'variant_pro_monthly_placeholder');
    }

    const checkoutUrl = `${storeUrl}/checkout/buy/${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(req.user.email)}`;

    res.json({
        success: true,
        mock: false,
        url: checkoutUrl
    });
});

/**
 * GET /api/v1/billing/verify-session
 * Verifies the session after user redirects back (useful for sandbox fallback).
 */
const verifySession = asyncWrapper(async (req, res) => {
    const { session_id } = req.query;
    const userId = req.user.id;

    if (!session_id) {
        throw new AppError('Session ID is required.', 400);
    }

    // If sandbox / mock
    if (session_id.startsWith('mock_sub_')) {
        const parts = session_id.split('_');
        // mock_sub_timestamp_userId_plan_billing
        const plan = parts[4] || 'pro';
        const billing = parts[5] || 'monthly';

        const expiresAt = new Date();
        if (billing === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Upgrade user
        await db.query(
            "UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?",
            [plan, expiresAt, userId]
        );

        console.log(`[BILLING] User #${userId} successfully upgraded to ${plan.toUpperCase()} via Sandbox Mock (Expires: ${expiresAt.toISOString().split('T')[0]})`);

        return res.json({
            success: true,
            plan,
            expiresAt: expiresAt.toISOString().split('T')[0],
            message: `Your account has been successfully upgraded to ${plan.toUpperCase()}!`
        });
    }

    // Otherwise, real payments are verified via LemonSqueezy webhook directly (asynchronous)
    res.json({
        success: true,
        message: 'Real payments are processed asynchronously. Please check your account profile for plan status.'
    });
});

/**
 * POST /api/v1/billing/lemonsqueezy-webhook
 * Receives Webhook events from LemonSqueezy, validates signature, and updates user plan.
 */
const lemonsqueezyWebhook = asyncWrapper(async (req, res) => {
    const signature = req.get('x-signature');
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('[LEMONSQUEEZY] Webhook endpoint called but Webhook Secret is not configured in .env');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    if (!signature) {
        throw new AppError('Webhook signature missing', 401);
    }

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const digest = hmac.update(rawBodyBuffer).digest('hex');

    let isValid = false;
    try {
        isValid = crypto.timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(digest, 'utf-8'));
    } catch (e) {
        isValid = false;
    }

    if (!isValid) {
        console.warn('[LEMONSQUEEZY] Webhook validation failed: Invalid signature');
        throw new AppError('Invalid webhook signature', 401);
    }

    const payload = req.body;
    const eventName = payload.meta?.event_name;

    console.log(`[LEMONSQUEEZY] Webhook received: ${eventName}`);

    if (eventName === 'order_created' || eventName === 'subscription_created') {
        const customData = payload.meta?.custom_data;
        const userId = customData?.user_id;
        const variantId = String(payload.data?.attributes?.variant_id || '');

        if (!userId) {
            console.warn('[LEMONSQUEEZY] No user_id found in webhook custom_data metadata.');
            return res.status(200).json({ success: true, message: 'No user_id found, ignoring.' });
        }

        // Determine plan based on variant ID (starter or pro)
        let plan = 'pro';
        if (
            variantId === process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT ||
            variantId === process.env.LEMONSQUEEZY_STARTER_YEARLY_VARIANT ||
            variantId.toLowerCase().includes('starter')
        ) {
            plan = 'starter';
        }

        // Calculate expiresAt
        const expiresAt = new Date();
        const isYearly = variantId === process.env.LEMONSQUEEZY_STARTER_YEARLY_VARIANT || 
                         variantId === process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT ||
                         JSON.stringify(payload).toLowerCase().includes('year') ||
                         JSON.stringify(payload).toLowerCase().includes('annual');

        if (isYearly) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Upgrade user
        await db.query(
            "UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?",
            [plan, expiresAt, userId]
        );

        console.log(`[LEMONSQUEEZY] User #${userId} successfully upgraded to ${plan.toUpperCase()} via Webhook (Expires: ${expiresAt.toISOString().split('T')[0]})`);
    }

    res.status(200).json({ success: true });
});

module.exports = {
    createCheckoutSession,
    verifySession,
    lemonsqueezyWebhook
};
