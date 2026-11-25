const pool = require('../config/db');

// @desc  Get user cart
// @route GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id, c.quantity, p.id AS productId, p.name, p.price, p.originalPrice, p.images, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
      [req.user.id]
    );
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ success: true, data: items, total: total.toFixed(2) });
  } catch (err) { next(err); }
};

// @desc  Add item to cart
// @route POST /api/cart/add
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const [product] = await pool.query('SELECT id, stock FROM products WHERE id = ? AND isActive = 1', [productId]);
    if (product.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product[0].stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
      [req.user.id, productId, quantity, quantity]
    );
    res.status(201).json({ success: true, message: 'Item added to cart' });
  } catch (err) { next(err); }
};

// @desc  Update cart item quantity
// @route PUT /api/cart/update/:id
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) { next(err); }
};

// @desc  Remove item from cart
// @route DELETE /api/cart/remove/:id
const removeFromCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) { next(err); }
};

// @desc  Clear entire cart
// @route DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
