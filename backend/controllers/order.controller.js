const pool = require('../config/db');
const { sendEmail, orderConfirmationEmail, shippingUpdateEmail } = require('../utils/sendEmail');

// @desc  Create order from cart
// @route POST /api/orders
const createOrder = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { shippingAddress } = req.body;

    const [cartItems] = await conn.query(
      `SELECT c.quantity, p.id AS productId, p.name, p.price, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
      [req.user.id]
    );
    if (cartItems.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
      }
    }

    const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, totalAmount, shippingAddress) VALUES (?, ?, ?)',
      [req.user.id, totalAmount.toFixed(2), JSON.stringify(shippingAddress)]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.commit();

    // Send confirmation email (non-blocking)
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed #${orderId} - IronForge Athletics`,
      html: orderConfirmationEmail(req.user.name, orderId, totalAmount.toFixed(2), cartItems)
    }).catch(() => {});

    res.status(201).json({ success: true, message: 'Order placed successfully', data: { orderId, totalAmount: totalAmount.toFixed(2) } });
  } catch (err) { await conn.rollback(); next(err); } finally { conn.release(); }
};

// @desc  Get user orders
// @route GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') AS productNames
       FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ? GROUP BY o.id ORDER BY o.createdAt DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.images FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: { ...orders[0], items } });
  } catch (err) { next(err); }
};

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    if (orders[0].status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) { next(err); }
};

module.exports = { createOrder, getOrders, getOrder, cancelOrder };
