const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { getAllReviews, addReview, updateReview, deleteReview } = require('../controllers/review.controller');

router.get('/product/:productId', getAllReviews);
router.post('/', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
