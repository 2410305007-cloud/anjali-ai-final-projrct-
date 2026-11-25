require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { initDB } = require('./models/index');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes    = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes    = require('./routes/cart.routes');
const orderRoutes   = require('./routes/order.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const reviewRoutes  = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes   = require('./routes/admin.routes');

const app = express();

/* ── Security Middleware ── */
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

/* ── Rate Limiting ── */
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests, please try again later.' } });
app.use('/api/', limiter);

/* ── Logging ── */
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

/* ── Body Parsing ── */
// Stripe webhook needs raw body — mount BEFORE json parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Static Files (uploaded images) ── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── API Routes ── */
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/admin',    adminRoutes);

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🏋️ IronForge Athletics API is running!', timestamp: new Date().toISOString() });
});

/* ── 404 Handler ── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

/* ── Global Error Handler ── */
app.use(errorHandler);

/* ── Start Server ── */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDB();
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 IronForge Athletics Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => { console.log('Server closed.'); process.exit(0); });
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
