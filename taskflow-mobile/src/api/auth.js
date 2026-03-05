import { doFetch } from './client';

export const authApi = {
    login: (email, password) => doFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),

    register: (name, email, password) => doFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    }),

    getMe: () => doFetch('/auth/me'),

    logout: () => doFetch('/auth/logout', { method: 'POST' }),

    requestPasswordReset: (email) => doFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),

    verifyPasswordReset: (email, otp, newPassword) => doFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword })
    }),
};
