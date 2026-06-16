const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        const user = await userModel.getUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }
        req.user = user;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { authenticate };
