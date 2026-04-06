const rateLimit = require('express-rate-limit');

/**
 * General rate limiter: 100 requests per minute per IP.
 * Applied on all API routes.
 */
const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many requests from this IP, please try again after a minute.' },
});

/**
 * Strict auth rate limiter: 5 requests per 15 minutes per IP.
 * Applied on sensitive auth routes (login, reset-password).
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many attempts. Please try again after 15 minutes.' },
});

/**
 * Notes write limiter: 60 requests per minute per IP.
 * Applied on notes block create/update endpoints to prevent spam.
 */
const notesLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many note operations. Please slow down.' },
});

module.exports = { generalLimiter, authLimiter, notesLimiter };
