const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:slug', getProductsByCategory);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin CRUD routes (protected)
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
