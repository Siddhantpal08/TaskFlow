import { doFetch } from './client';

export const eventsApi = {
    list: () => {
        const now = new Date();
        return doFetch(`/calendar/events?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
    },

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
