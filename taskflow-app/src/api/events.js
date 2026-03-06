import { api } from './client.js';

export const eventsApi = {
    list: () => api.get('/calendar/events'),
    create: (data) => api.post('/calendar/events', data),
    update: (id, data) => api.put(`/calendar/events/${id}`, data),
    delete: (id) => api.delete(`/calendar/events/${id}`),
};
