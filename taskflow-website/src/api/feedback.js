import { api } from './client.js';

export const feedbackApi = {
    submit: (rating, message) => api.post('/feedback', { rating, message }),
    submitTicket: (title, category, description) => api.post('/feedback/tickets', { title, category, description }),
    list: () => api.get('/feedback'),              // admin only — full list
    updateStatus: (id, status) => api.patch(`/feedback/${id}/status`, { status }), // admin only
    delete: (id) => api.delete(`/feedback/${id}`), // admin only
    getPublic: () => api.get('/feedback/public'),  // all users — anonymized top-voted
    upvote: (id) => api.put(`/feedback/${id}/upvote`), // upvote a feedback entry
};
