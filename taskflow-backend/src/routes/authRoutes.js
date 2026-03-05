const express = require('express');
const {
    register,
    login,
    refresh,
    logout,
    requestPasswordReset,
    verifyPasswordReset,
} = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const Joi = require('joi');

const router = express.Router();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const resetRequestSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetVerifySchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).max(128).required(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/register', validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout); // optionally authenticate for online-status update
router.post('/reset-password', authLimiter, validate(resetRequestSchema), requestPasswordReset);
router.post('/reset-password/verify', authLimiter, validate(resetVerifySchema), verifyPasswordReset);

module.exports = router;
