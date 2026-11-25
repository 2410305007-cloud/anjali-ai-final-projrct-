// admin.controller.js
// Handles admin dashboard stats and recent orders

const pool = require('../config/db');

// @desc Get dashboard statistics
// @route GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[ordersCount]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[productsCount]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[revenue]] = await pool.query('SELECT IFNULL(SUM(totalAmount),0) AS revenue FROM orders WHERE paymentStatus = \"paid\"');

    res.json({
      success: true,
      data: {
        totalUsers: usersCount.totalUsers,
        totalOrders: ordersCount.totalOrders,
        totalProducts: productsCount.totalProducts,
        revenue: parseFloat(revenue.revenue).toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get recent orders (last 10)
// @route GET /api/admin/recent-orders
const getRecentOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, o.totalAmount, o.status, o.paymentStatus, o.createdAt, u.name AS customerName, u.email AS customerEmail
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.createdAt DESC
      LIMIT 10`);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getRecentOrders };
