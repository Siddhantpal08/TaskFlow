/**
 * adminRoutes.js
 * Mounted at: /api/college/v1/admin AND /api/v1/admin
 * All routes require: authenticate() + requireAdmin()
 */
const router       = require('express').Router();
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const admin        = require('../controllers/adminController');

router.use(authenticate); // Ensure req.user is populated from JWT and DB
router.use(requireAdmin); // Ensure role === 'admin'

router.get('/stats',              admin.getStats);
router.get('/users',              admin.getUsers);
router.patch('/users/:id/plan',   admin.updateUserPlan);
router.patch('/users/:id/role',   admin.updateUserRole);
router.delete('/users/:id',       admin.deleteUser);
router.get('/storage',            admin.getStorageBreakdown);

module.exports = router;
