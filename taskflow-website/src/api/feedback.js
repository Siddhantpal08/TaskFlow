import { api } from './client.js';

export const feedbackApi = {
    submit: (rating, message) => api.post('/feedback', { rating, message }),
    submitTicket: (title, category, description) => api.post('/feedback/tickets', { title, category, description }),
    list: () => api.get('/feedback'), // admin only
};
