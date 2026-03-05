import { api } from './client.js';

export const tasksApi = {
    list: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/tasks${params ? `?${params}` : ''}`);
    },
    get: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
    delegate: (id, assigned_to) => api.patch(`/tasks/${id}/delegate`, { assigned_to }),
    delete: (id) => api.delete(`/tasks/${id}`),
    bulkDelete: (ids) => api.delete('/tasks', { ids }),
};
