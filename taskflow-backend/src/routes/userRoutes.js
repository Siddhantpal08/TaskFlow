const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDashboard, getMe, updateMe, changePassword } = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/users/me', getMe);
router.patch('/users/me', updateMe);
router.patch('/auth/change-password', changePassword);

module.exports = router;
