import { api } from './client.js';

export const adminApi = {
    getStats:        ()                     => api.get('/admin/stats'),
    getUsers:        (params = {})          => api.get(`/admin/users?${new URLSearchParams(params)}`),
    updateUserPlan:  (id, plan, expiresAt)  => api.patch(`/admin/users/${id}/plan`, { plan, expiresAt }),
    updateUserRole:  (id, role)             => api.patch(`/admin/users/${id}/role`, { role }),
    deleteUser:      (id)                   => api.delete(`/admin/users/${id}`),
    getStorage:      ()                     => api.get('/admin/storage'),
};
