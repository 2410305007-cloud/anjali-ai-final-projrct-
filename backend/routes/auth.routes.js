const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register);

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
