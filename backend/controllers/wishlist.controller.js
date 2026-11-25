const pool = require('../config/db');

// @desc  Get wishlist
// @route GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT w.id, w.createdAt, p.id AS productId, p.name, p.price, p.originalPrice, p.images, p.rating
       FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

// @desc  Toggle product in wishlist
// @route POST /api/wishlist/toggle
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const [existing] = await pool.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);

    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
      return res.json({ success: true, message: 'Removed from wishlist', wishlisted: false });
    }

    await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
    res.status(201).json({ success: true, message: 'Added to wishlist', wishlisted: true });
  } catch (err) { next(err); }
};

// @desc  Remove from wishlist
// @route DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { next(err); }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };
