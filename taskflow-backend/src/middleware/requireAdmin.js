/**
 * requireAdmin.js
 * Middleware — blocks non-admin users with 403.
 * Expects req.user to already be populated by authenticate().
 */
module.exports = function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ status: 'fail', message: 'Admin access required.' });
    }
    next();
};
