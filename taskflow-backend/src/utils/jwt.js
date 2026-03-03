const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const generateTokens = (userId) => {
    // Access token valid for 15 minutes
    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });

    // Refresh token valid for 7 days
    const refreshToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    generateTokens,
    verifyToken
};
