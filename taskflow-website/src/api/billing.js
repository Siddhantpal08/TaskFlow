import { api } from './client.js';

export const billingApi = {
    // Create checkout session / subscription order
    createCheckoutSession: (billing, plan = 'pro') =>
        api.post('/billing/create-checkout-session', { billing, plan }),

    createSubscription: (billing, plan = 'pro') =>
        api.post('/billing/create-subscription', { billing, plan }),

    // Verify payment after Razorpay checkout completes
    verifyPayment: (data) => api.post('/billing/verify-payment', data),

    // Get current plan status from server
    getPlanStatus: () => api.get('/billing/plan-status'),

    // Cancel active subscription
    cancelSubscription: () => api.post('/billing/cancel-subscription'),

    // Legacy compat
    verifySession: (sessionId) => api.get(`/billing/verify-session?session_id=${sessionId}`),
};

// ── Load Razorpay checkout script dynamically ────────────────────────────────
export function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}
