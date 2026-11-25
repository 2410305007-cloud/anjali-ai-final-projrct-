const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { getStats, getRecentOrders } = require('../controllers/admin.controller');

router.get('/stats', protect, admin, getStats);
router.get('/recent-orders', protect, admin, getRecentOrders);

module.exports = router;
