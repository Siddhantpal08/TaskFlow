import { doFetch } from './client';

export const authApi = {
    // POST /auth/login → { data: { accessToken, refreshToken, id, name, ... } }
    login: (email, password) => doFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),

    // POST /auth/register → { data: { email } } — sends OTP, does NOT return token
    register: (name, email, password) => doFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    }),

    // POST /auth/verify-email → { data: { accessToken, refreshToken, id, name, ... } }
    verifyEmail: (email, otp) => doFetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
    }),

    // POST /auth/resend-otp
    resendOtp: (email) => doFetch('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),

    // GET /users/me — returns current user profile
    getMe: () => doFetch('/users/me'),

    // POST /auth/logout
    logout: () => doFetch('/auth/logout', { method: 'POST' }),

    // POST /auth/reset-password → send OTP to email
    requestPasswordReset: (email) => doFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),

    // POST /auth/reset-password/verify → validate OTP + set new password
    verifyPasswordReset: (email, otp, newPassword) => doFetch('/auth/reset-password/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
    }),
};
