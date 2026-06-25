const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDashboard, getMe, updateMe, deleteMe } = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/users/me', getMe);
router.patch('/users/me', updateMe);
router.delete('/users/me', deleteMe); // GDPR: self account deletion with password confirmation

module.exports = router;
