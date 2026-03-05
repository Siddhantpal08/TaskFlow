import { doFetch } from './client';

export const notificationsApi = {
    list: (since) => {
        const query = since ? `?since=${encodeURIComponent(since)}` : '';
        return doFetch(`/notifications${query}`);
    },
    markRead: (id) => doFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => doFetch('/notifications/read-all', { method: 'PATCH' }),
};
