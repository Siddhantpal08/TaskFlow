import { doFetch } from './client';

export const eventsApi = {
    list: () => doFetch('/calendar/events'),

    create: (data) => doFetch('/calendar/events', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => doFetch(`/calendar/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => doFetch(`/calendar/events/${id}`, { method: 'DELETE' }),
};
