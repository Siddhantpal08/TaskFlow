import { api } from './client.js';

export const feedbackApi = {
    submit: (rating, message) => api.post('/feedback', { rating, message }),
    list: () => api.get('/feedback'), // admin only
};
