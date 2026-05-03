const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDashboard, getMe, updateMe } = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/users/me', getMe);
router.patch('/users/me', updateMe);

module.exports = router;
