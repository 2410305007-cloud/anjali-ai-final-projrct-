const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, getOrders, getOrderById, cancelOrder } = require('../controllers/order.controller');

router.use(protect);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
