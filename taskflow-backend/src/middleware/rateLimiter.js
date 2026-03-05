const rateLimit = require('express-rate-limit');

/**
 * General rate limiter: 100 requests per minute per IP.
 * Applied on all API routes.
 */
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many requests from this IP, please try again after a minute.',
    },
});

/**
 * Strict rate limiter: 5 requests per 15 minutes per IP.
 * Applied on sensitive auth routes (login, reset-password).
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many attempts. Please try again after 15 minutes.',
    },
});

module.exports = { generalLimiter, authLimiter };
