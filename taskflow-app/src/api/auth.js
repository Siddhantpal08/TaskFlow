import { api } from './client.js';

export const authApi = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),

    logout: () =>
        api.post('/auth/logout', {}),

    googleLogin: (credential) =>
        api.post('/auth/google', { credential }),

    refresh: () =>
        api.post('/auth/refresh', {}),

    verifyEmail: (email, otp) =>
        api.post('/auth/verify-email', { email, otp }),

    resendOtp: (email) =>
        api.post('/auth/resend-otp', { email }),

    requestPasswordReset: (email) =>
        api.post('/auth/reset-password', { email }),

    verifyPasswordReset: (email, otp, newPassword) =>
        api.post('/auth/reset-password/verify', { email, otp, newPassword }),

    getMe: () =>
        api.get('/users/me'),
};
