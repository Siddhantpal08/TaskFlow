import { api } from './client.js';

export const eventsApi = {
    list: () => api.get('/calendar'),
    create: (data) => api.post('/calendar', data),
    update: (id, data) => api.put(`/calendar/${id}`, data),
    delete: (id) => api.delete(`/calendar/${id}`),
};
