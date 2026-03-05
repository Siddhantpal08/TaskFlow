const bcrypt = require('bcrypt');
const asyncWrapper = require('../utils/asyncWrapper');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const userModel = require('../models/userModel');
const { createOtp, verifyOtp } = require('../utils/otpStore');
const { sendOtpEmail } = require('../utils/mailer');

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Body: { name, email, password }
 */
const register = asyncWrapper(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check duplicate email — 409 per spec
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
        return next(new AppError('Email is already registered.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Derive avatar initials from name (first letter of each word, max 2)
    const avatar_initials = name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const insertId = await userModel.createUser(name, email, hashedPassword, avatar_initials);

    // Auto-login on register
    const { accessToken, refreshToken } = generateTokens(insertId);
    await userModel.saveRefreshToken(insertId, refreshToken);

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        success: true,
        data: { id: insertId, name, email, avatar_initials, accessToken },
    });
});

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await userModel.getUserByEmail(email);
    // Generic message to prevent email enumeration
    if (!user) {
        return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password.', 401));
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    await userModel.saveRefreshToken(user.id, refreshToken);

    // Mark user as online
    await userModel.setOnlineStatus(user.id, true);

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_initials: user.avatar_initials,
            accessToken,
        },
    });
});

// ─── Refresh Token (with rotation) ───────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh
 * Reads refresh_token cookie; rotates it (old deleted, new issued).
 */
const refresh = asyncWrapper(async (req, res, next) => {
    // Cookies for web, body for mobile (Expo/React Native can't use httpOnly cookies)
    const oldRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!oldRefreshToken) {
        return next(new AppError('No refresh token provided.', 401));
    }

    // Verify token signature + expiry
    let decoded;
    try {
        decoded = verifyRefreshToken(oldRefreshToken);
    } catch {
        return next(new AppError('Invalid or expired refresh token.', 401));
    }

    // Confirm it exists in DB (checks rotation: once used, it's deleted)
    const tokenRecord = await userModel.findRefreshToken(oldRefreshToken);
    if (!tokenRecord) {
        // Potential token reuse — clear all tokens for this user (security)
        await userModel.deleteAllRefreshTokensForUser(decoded.id);
        return next(new AppError('Refresh token reuse detected. Please log in again.', 401));
    }

    // Delete old token (rotation)
    await userModel.deleteRefreshToken(oldRefreshToken);

    // Issue new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    await userModel.saveRefreshToken(decoded.id, newRefreshToken);

    res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, accessToken });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 * Invalidates the refresh token for this device only.
 */
const logout = asyncWrapper(async (req, res, next) => {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
        await userModel.deleteRefreshToken(refreshToken);
    }

    // Mark user offline if user is authenticated (token in header)
    if (req.user) {
        await userModel.setOnlineStatus(req.user.id, false);
    }

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// ─── Request Password Reset ───────────────────────────────────────────────────

/**
 * POST /api/v1/auth/reset-password
 * Body: { email }
 * Sends a 6-digit OTP to the user's email.
 */
const requestPasswordReset = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;

    // Always respond with 200 to prevent email enumeration
    const user = await userModel.getUserByEmail(email);
    if (!user) {
        return res.status(200).json({
            success: true,
            message: 'If that email is registered, an OTP has been sent.',
        });
    }

    const otp = createOtp(email);

    // Send email — if it fails, we still want to handle it gracefully
    try {
        await sendOtpEmail(email, otp);
    } catch (err) {
        console.error('[Mailer Error]:', err.message);
        return next(new AppError('Failed to send OTP email. Please try again later.', 500));
    }

    res.status(200).json({
        success: true,
        message: 'If that email is registered, an OTP has been sent.',
    });
});

// ─── Verify OTP + Set New Password ───────────────────────────────────────────

/**
 * POST /api/v1/auth/reset-password/verify
 * Body: { email, otp, newPassword }
 */
const verifyPasswordReset = asyncWrapper(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;

    const result = verifyOtp(email, otp);
    if (!result.valid) {
        return next(new AppError(result.reason, 422));
    }

    // Check user still exists
    const user = await userModel.getUserByEmail(email);
    if (!user) {
        return next(new AppError('User not found.', 404));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userModel.updatePassword(user.id, hashedPassword);

    // Invalidate all refresh tokens (force re-login on all devices)
    await userModel.deleteAllRefreshTokensForUser(user.id);

    res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
    });
});

module.exports = { register, login, refresh, logout, requestPasswordReset, verifyPasswordReset };
