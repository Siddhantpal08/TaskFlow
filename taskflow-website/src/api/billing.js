import { api } from './client.js';

export const billingApi = {
    createCheckoutSession: (billing, plan = 'pro') => api.post('/billing/create-checkout-session', { billing, plan }),
    verifySession: (sessionId) => api.get(`/billing/verify-session?session_id=${sessionId}`),
};
