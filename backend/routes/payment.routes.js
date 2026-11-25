const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, stripeWebhook } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
