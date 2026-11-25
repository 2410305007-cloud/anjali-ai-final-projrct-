const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

// @desc  Create Stripe payment intent
// @route POST /api/payment/create-payment-intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = orders[0];
    if (order.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Order already paid' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // cents
      currency: 'usd',
      metadata: { orderId: String(orderId), userId: String(req.user.id) },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
};

// @desc  Confirm payment
// @route POST /api/payment/confirm
const confirmPayment = async (req, res, next) => {
  try {
    const { orderId, stripePaymentId } = req.body;
    await pool.query(
      'UPDATE orders SET paymentStatus=?, stripePaymentId=?, status=? WHERE id=? AND user_id=?',
      ['paid', stripePaymentId, 'processing', orderId, req.user.id]
    );
    res.json({ success: true, message: 'Payment confirmed successfully' });
  } catch (err) { next(err); }
};

// @desc  Stripe webhook
// @route POST /api/payment/webhook
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const { orderId } = event.data.object.metadata;
    await pool.query('UPDATE orders SET paymentStatus=?, status=? WHERE id=?', ['paid', 'processing', orderId]);
  }

  res.json({ received: true });
};

module.exports = { createPaymentIntent, confirmPayment, stripeWebhook };
