const bcrypt = require('bcrypt');
const asyncWrapper = require('../utils/asyncWrapper');
const { generateTokens } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const userModel = require('../models/userModel');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = asyncWrapper(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email, and password', 400));
    }

    // Check if user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
        return next(new AppError('Email is already registered', 409));
    }

    // Hash password
    const saltRounds = 12; // Required per TASKFLOW_DOCS.md Section 14
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const insertId = await userModel.createUser(name, email, hashedPassword);

    // Auto-login (optional, but requested per spec pattern)
    const { accessToken, refreshToken } = generateTokens(insertId);
    await userModel.saveRefreshToken(insertId, refreshToken);

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
        success: true,
        data: {
            id: insertId,
            name,
            email,
            accessToken
        }
    });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await userModel.getUserByEmail(email);
    if (!user) {
        return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password', 401));
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    await userModel.saveRefreshToken(user.id, refreshToken);

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            accessToken
        }
    });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
const refresh = asyncWrapper(async (req, res, next) => {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
        return next(new AppError('No refresh token provided', 401));
    }

    // Find token in DB
    const tokenRecord = await userModel.findRefreshToken(refreshToken);
    if (!tokenRecord) {
        return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Generate new access token
    const { accessToken } = generateTokens(tokenRecord.user_id);

    // Note: Rotating refresh token here could be added per spec, 
    // but relying on DB expiration is the base pattern for now.

    res.status(200).json({
        success: true,
        accessToken
    });
});

// @desc    Logout user (invalidates refresh token)
// @route   POST /api/auth/logout
const logout = asyncWrapper(async (req, res, next) => {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
        await userModel.deleteRefreshToken(refreshToken);
    }

    res.clearCookie('refresh_token');

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = {
    register,
    login,
    refresh,
    logout
};
