/**
 * In-memory OTP store with TTL, attempt tracking, and lockout.
 * Per TASKFLOW_DOCS.md §11: 6-digit OTP, valid 10 min, max 3 attempts, 15 min lockout.
 *
 * Structure: Map<email, { otp, expiresAt, attempts, lockedUntil }>
 */
const store = new Map();

const OTP_TTL_MS = 10 * 60 * 1000;       // 10 minutes
const LOCKOUT_MS = 15 * 60 * 1000;        // 15 minutes lockout
const MAX_ATTEMPTS = 3;

/** Generate a random 6-digit OTP string */
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

/**
 * Create and store a new OTP for the given email.
 * Overwrites any existing entry.
 * @returns {string} The generated OTP (caller passes to mailer)
 */
const createOtp = (email) => {
    const otp = generateOtp();
    store.set(email, {
        otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0,
        lockedUntil: null,
    });
    return otp;
};

/**
 * Verify an OTP for the given email.
 * @returns {{ valid: boolean, reason?: string }}
 */
const verifyOtp = (email, inputOtp) => {
    const entry = store.get(email);

    if (!entry) {
        return { valid: false, reason: 'No OTP found. Please request a new one.' };
    }

    // Check lockout
    if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
        const minutesLeft = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
        return { valid: false, reason: `Too many attempts. Try again in ${minutesLeft} minute(s).` };
    }

    // Check expiry
    if (Date.now() > entry.expiresAt) {
        store.delete(email);
        return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }

    entry.attempts += 1;

    // Wrong OTP
    if (entry.otp !== String(inputOtp)) {
        if (entry.attempts >= MAX_ATTEMPTS) {
            entry.lockedUntil = Date.now() + LOCKOUT_MS;
        }
        return { valid: false, reason: 'Invalid OTP.' };
    }

    // Correct OTP — clear entry
    store.delete(email);
    return { valid: true };
};

/** Remove OTP entry for an email (e.g. after password reset) */
const clearOtp = (email) => store.delete(email);

module.exports = { createOtp, verifyOtp, clearOtp };
