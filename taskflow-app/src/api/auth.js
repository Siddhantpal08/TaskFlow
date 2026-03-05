import { api } from './client.js';

export const authApi = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),

    logout: () =>
        api.post('/auth/logout', {}),

    refresh: () =>
        api.post('/auth/refresh', {}),

    requestPasswordReset: (email) =>
        api.post('/auth/reset-password', { email }),

    verifyPasswordReset: (email, otp, newPassword) =>
        api.post('/auth/reset-password/verify', { email, otp, newPassword }),

    getMe: () =>
        api.get('/users/me'),
};
