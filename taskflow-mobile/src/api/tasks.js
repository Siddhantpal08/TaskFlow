import { doFetch } from './client';

export const tasksApi = {
    list: (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        return doFetch(`/tasks${query ? `?${query}` : ''}`);
    },

    get: (id) => doFetch(`/tasks/${id}`),

    create: (data) => doFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => doFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    updateStatus: (id, status) => doFetch(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    }),

    delegate: (id, assigneeId) => doFetch(`/tasks/${id}/delegate`, {
        method: 'POST',
        body: JSON.stringify({ assigned_to: assigneeId })
    }),

    delete: (id) => doFetch(`/tasks/${id}`, { method: 'DELETE' }),
};
