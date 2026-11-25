const mysql2 = require('mysql2/promise');
require('dotenv').config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ironforge_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected Successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

module.exports = pool;
