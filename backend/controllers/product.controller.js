// product.controller.js – basic implementations
const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Helper to parse pagination params
const getPagination = (page = 1, limit = 12) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

// @desc Get all products with optional filters & pagination
const getAllProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, rating, sort, page, limit, search } = req.query;
    const { limit: lim, offset } = getPagination(page, limit);
    let where = [];
    let params = [];

    if (search) {
      where.push('name LIKE ?');
      params.push(`%${search}%`);
    }
    if (category) {
      where.push('category_id = (SELECT id FROM categories WHERE slug = ?)');
      params.push(category);
    }
    if (minPrice) {
      where.push('price >= ?');
      params.push(minPrice);
    }
    if (maxPrice) {
      where.push('price <= ?');
      params.push(maxPrice);
    }
    if (rating) {
      where.push('rating >= ?');
      params.push(rating);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderClause = sort ? `ORDER BY ${sort.replace('_', ' ')}` : 'ORDER BY createdAt DESC';

    const [rows] = await pool.query(
      `SELECT * FROM products ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// @desc Get product by ID
const getProductById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// @desc Get featured products (isFeatured flag)
const getFeaturedProducts = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE isFeatured = 1 AND isActive = 1 LIMIT 8');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// @desc Get products by category slug
const getProductsByCategory = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const [rows] = await pool.query(
      `SELECT p.* FROM products p JOIN categories c ON p.category_id = c.id WHERE c.slug = ? AND p.isActive = 1`,
      [slug]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// @desc Search products (alias for getAllProducts with search query)
const searchProducts = async (req, res, next) => {
  req.query.search = req.query.q || '';
  await getAllProducts(req, res, next);
};

// --- Admin CRUD (protected) ---
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
    const { name, description, price, originalPrice, discount, stock, category_id, images, rating, isFeatured } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, price, originalPrice, discount, stock, category_id, images, rating, isFeatured, isActive)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`,
      [name, slug, description, price, originalPrice, discount, stock, category_id, JSON.stringify(images||[]), rating||0, isFeatured?1:0]
    );
    res.status(201).json({ success: true, message: 'Product created', productId: result.insertId });
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = [];
    const params = [];
    const allowed = ['name','description','price','originalPrice','discount','stock','category_id','images','rating','isFeatured','isActive'];
    allowed.forEach(f => {
      if (req.body[f] !== undefined) { fields.push(`${f} = ?`); params.push(req.body[f]); }
    });
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    params.push(id);
    const [result] = await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Product updated', affectedRows: result.affectedRows });
  } catch (err) { next(err); }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted', affectedRows: result.affectedRows });
  } catch (err) { next(err); }
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
