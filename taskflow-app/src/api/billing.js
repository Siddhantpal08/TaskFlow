import { api } from './client.js';

export const billingApi = {
    createCheckoutSession: (billing) => api.post('/billing/create-checkout-session', { billing }),
    verifySession: (sessionId) => api.get(`/billing/verify-session?session_id=${sessionId}`),
};
