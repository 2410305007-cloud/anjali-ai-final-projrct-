const pool = require('../config/db');

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    // Users
    await conn.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','admin') DEFAULT 'user',
      avatar VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      city VARCHAR(100) DEFAULT NULL,
      country VARCHAR(100) DEFAULT NULL,
      isVerified TINYINT(1) DEFAULT 0,
      resetPasswordToken VARCHAR(255) DEFAULT NULL,
      resetPasswordExpires DATETIME DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // Categories
    await conn.query(`CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      icon VARCHAR(10) DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products
    await conn.query(`CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(200) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      price DECIMAL(10,2) NOT NULL,
      originalPrice DECIMAL(10,2) DEFAULT NULL,
      discount INT DEFAULT 0,
      stock INT DEFAULT 0,
      category_id INT,
      images JSON DEFAULT NULL,
      rating DECIMAL(3,2) DEFAULT 0.00,
      reviewCount INT DEFAULT 0,
      isFeatured TINYINT(1) DEFAULT 0,
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`);

    // Cart
    await conn.query(`CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_cart_item (user_id, product_id)
    )`);

    // Orders
    await conn.query(`CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      totalAmount DECIMAL(10,2) NOT NULL,
      status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
      paymentStatus ENUM('pending','paid','failed') DEFAULT 'pending',
      paymentMethod VARCHAR(50) DEFAULT 'stripe',
      stripePaymentId VARCHAR(255) DEFAULT NULL,
      shippingAddress JSON DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Order Items
    await conn.query(`CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`);

    // Wishlist
    await conn.query(`CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_wishlist (user_id, product_id)
    )`);

    // Reviews
    await conn.query(`CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title VARCHAR(200) DEFAULT NULL,
      comment TEXT DEFAULT NULL,
      isVerified TINYINT(1) DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_review (user_id, product_id)
    )`);

    // Newsletter
    await conn.query(`CREATE TABLE IF NOT EXISTS newsletter (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(150) NOT NULL UNIQUE,
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ All database tables initialized');

    // Seed default categories
    await conn.query(`INSERT IGNORE INTO categories (name, slug, description, icon) VALUES
      ('Dumbbells & Weights', 'weights', 'Free weights and barbell equipment', '🏋️'),
      ('Resistance Bands', 'bands', 'All resistance and stretch bands', '💪'),
      ('Protein Supplements', 'supplements', 'Proteins, pre-workouts and amino acids', '🥤'),
      ('Gym Apparel', 'apparel', 'Athletic clothing and accessories', '👕'),
      ('Cardio Equipment', 'cardio', 'Treadmills, bikes and more', '🚴'),
      ('Recovery & Wellness', 'recovery', 'Foam rollers, massage tools', '🧘')
    `);
    console.log('✅ Categories seeded');

  } finally {
    conn.release();
  }
};

module.exports = { initDB };
