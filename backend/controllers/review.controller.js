// review.controller.js – handles product reviews
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// @desc Get all reviews for a product
// @route GET /api/reviews/product/:productId
const getAllReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.comment, r.isVerified, r.createdAt, u.name AS author
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.createdAt DESC`,
      [productId]
    );
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};

// @desc Add a review (one per user per product)
// @route POST /api/reviews
const addReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.id;
    const [exist] = await pool.query('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (exist.length) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, title, comment, isVerified) VALUES (?,?,?,?,?,0)',
      [userId, productId, rating, title, comment]
    );
    await updateProductRating(productId);
    res.status(201).json({ success: true, message: 'Review added', reviewId: result.insertId });
  } catch (err) { next(err); }
};

// @desc Update own review
// @route PUT /api/reviews/:id
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const [rows] = await pool.query('SELECT product_id FROM reviews WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found' });
    const productId = rows[0].product_id;
    await pool.query('UPDATE reviews SET rating = ?, title = ?, comment = ? WHERE id = ?', [rating, title, comment, id]);
    await updateProductRating(productId);
    res.json({ success: true, message: 'Review updated' });
  } catch (err) { next(err); }
};

// @desc Delete own review
// @route DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT product_id FROM reviews WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found' });
    const productId = rows[0].product_id;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    await updateProductRating(productId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// Helper to recompute average rating & count for a product
const updateProductRating = async (productId) => {
  const [[agg]] = await pool.query('SELECT AVG(rating) AS avgRating, COUNT(*) AS count FROM reviews WHERE product_id = ?', [productId]);
  const avg = agg.avgRating ? parseFloat(agg.avgRating).toFixed(2) : 0;
  await pool.query('UPDATE products SET rating = ?, reviewCount = ? WHERE id = ?', [avg, agg.count, productId]);
};

module.exports = { getAllReviews, addReview, updateReview, deleteReview };
