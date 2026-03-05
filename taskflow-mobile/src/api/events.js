import { doFetch } from './client';

export const eventsApi = {
    list: () => doFetch('/calendar'),

    create: (data) => doFetch('/calendar', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => doFetch(`/calendar/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => doFetch(`/calendar/${id}`, { method: 'DELETE' }),
};
