const bcrypt = require('bcrypt');
const asyncWrapper = require('../utils/asyncWrapper');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const userModel = require('../models/userModel');
const { createOtp, verifyOtp } = require('../utils/otpStore');
const { sendOtpEmail } = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const otp = createOtp(email);
    await sendOtpEmail(email, otp);

    res.status(201).json({
        success: true,
        data: { message: "Account created. Please verify your email.", email },
    });
});

/**
 * POST /api/v1/auth/verify-email
 * Body: { email, otp }
 */
const verifyEmail = asyncWrapper(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new AppError('Email and OTP are required.', 400));

    const result = verifyOtp(email, otp);
    if (!result.valid) return next(new AppError(result.reason, 400));

    const user = await userModel.getUserByEmail(email);
    if (!user) return next(new AppError('User not found.', 404));

    await userModel.verifyUserEmail(user.id);

    const { accessToken, refreshToken } = generateTokens(user.id);
    await userModel.saveRefreshToken(user.id, refreshToken);

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        data: { id: user.id, name: user.name, email: user.email, avatar_initials: user.avatar_initials, accessToken, refreshToken },
    });
});

/**
 * POST /api/v1/auth/google
 * Body: { credential }
 */
const googleLogin = asyncWrapper(async (req, res, next) => {
    const { credential } = req.body;
    if (!credential) return next(new AppError('Google credential is required', 400));

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: [
                process.env.GOOGLE_CLIENT_ID,
                '491185646983-vthvdtat2avpv0o95vaf157rhbok9if8.apps.googleusercontent.com', // New Web Client
                '491185646983-nl4uhet9nirkmgu664p7l1hr4dk933hn.apps.googleusercontent.com', // New Android Client
                '491185646983-sprdq04cfjcfq3mphq97a09qmhomobcj.apps.googleusercontent.com'  // Old Web Client
            ].filter(Boolean),
        });
        const payload = ticket.getPayload();
        const { email, name, sub: google_id, picture: avatar_url, email_verified } = payload;

        if (!email_verified) return next(new AppError('Google email not verified', 400));

        let user = await userModel.getUserByEmail(email);
        let userId;

        if (user) {
            userId = user.id;
            await userModel.updateGoogleProfile(userId, google_id, avatar_url);
            if (!user.is_email_verified) {
                await userModel.verifyUserEmail(userId);
            }
        } else {
            const avatar_initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
            userId = await userModel.createUser(name, email, dummyPassword, avatar_initials);
            await userModel.updateGoogleProfile(userId, google_id, avatar_url);
            await userModel.verifyUserEmail(userId);
        }

        const { accessToken, refreshToken } = generateTokens(userId);
        await userModel.saveRefreshToken(userId, refreshToken);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        const finalUser = await userModel.getUserById(userId);

        res.status(200).json({
            success: true,
            data: { ...finalUser, accessToken, refreshToken },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        return next(new AppError(error.message || 'Invalid Google credential', 400));
    }
});

/**
 * POST /api/v1/auth/resend-otp
 * Body: { email }
 */
const resendOtp = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(200).json({ success: true, message: "If registered, an OTP will be sent." });
    if (user.is_email_verified) return next(new AppError('Email is already verified.', 400));

    const otp = createOtp(email);
    await sendOtpEmail(email, otp);

    res.status(200).json({ success: true, data: { message: "OTP sent." } });
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

    if (!user.is_email_verified) {
        return next(new AppError('Please verify your email to log in.', 403));
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
        secure: true,
        sameSite: 'None',
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_initials: user.avatar_initials,
            role: user.role,
            bio: user.bio,
            avatar_url: user.avatar_url,
            accessToken,
            refreshToken,
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
        secure: true,
        sameSite: 'None',
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });
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
        secure: true,
        sameSite: 'None',
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

// ─── Reset Local Note PIN ────────────────────────────────────────────────────

const requestPinReset = asyncWrapper(async (req, res, next) => {
    const user = await userModel.getUserById(req.user.id);
    const otp = createOtp(user.email);
    await sendOtpEmail(user.email, otp);
    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
});

const verifyPinReset = asyncWrapper(async (req, res, next) => {
    const { otp } = req.body;
    const user = await userModel.getUserById(req.user.id);
    const result = verifyOtp(user.email, otp);
    if (!result.valid) return next(new AppError(result.reason, 422));
    res.status(200).json({ success: true, message: 'PIN has been reset.' });
});

module.exports = { register, verifyEmail, resendOtp, googleLogin, login, refresh, logout, requestPasswordReset, verifyPasswordReset, requestPinReset, verifyPinReset };
