const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');
const { sendEmail, welcomeEmail, passwordResetEmail } = require('../utils/sendEmail');

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { name, email, password } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const user = { id: result.insertId, name, email, role: 'user' };
    const token = generateToken(user);

    // Send welcome email (non-blocking)
    sendEmail({ to: email, subject: 'Welcome to IronForge Athletics! 🏋️', html: welcomeEmail(name) }).catch(() => {});

    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  } catch (err) { next(err); }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({ success: true, message: 'Login successful', token, user: safeUser });
  } catch (err) { next(err); }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, country } = req.body;
    await pool.query(
      'UPDATE users SET name=?, phone=?, address=?, city=?, country=? WHERE id=?',
      [name, phone, address, city, country, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) { next(err); }
};

// @desc  Change password
// @route PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await pool.query('UPDATE users SET resetPasswordToken=?, resetPasswordExpires=? WHERE email=?', [token, expires, email]);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: email, subject: 'Password Reset - IronForge Athletics', html: passwordResetEmail(rows[0].name, resetUrl) });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
      [token]
    );
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    const hashed = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password=?, resetPasswordToken=NULL, resetPasswordExpires=NULL WHERE id=?',
      [hashed, rows[0].id]
    );
    res.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
