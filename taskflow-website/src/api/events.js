import { api } from './client.js';

export const eventsApi = {
    list: (year, month) => {
        const params = year && month ? `?year=${year}&month=${month}` : '';
        return api.get(`/calendar/events${params}`);
    },
    create: (data) => api.post('/calendar/events', data),
    update: (id, data) => api.put(`/calendar/events/${id}`, data),
    delete: (id) => api.delete(`/calendar/events/${id}`),
};
