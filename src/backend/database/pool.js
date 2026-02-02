/**
 * PostgreSQL Database Pool
 * Manages database connections for the application
 */

const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../../config/.env' });

// Database connection configuration
// Support both DATABASE_URL (Neon/Production) and individual vars (local)
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      user: process.env.DB_USER || 'clinical_app',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'clinical_system',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Database pool connected');
});

// Test connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.warn('⚠️ Database not available yet. Will retry on first query.');
    console.warn('Error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

module.exports = pool;
