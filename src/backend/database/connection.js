// Database Connection Pool
// This file will be populated after PostgreSQL is installed

const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../../config/.env' });

console.log('🔄 Initializing database connection pool...');

// Create connection pool - support DATABASE_URL for Neon/Production
let pool;

if (process.env.DATABASE_URL) {
  console.log('📡 Using DATABASE_URL for connection (Neon/Production)');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
} else {
  console.log('📡 Using individual DB vars for connection (Local)');
  pool = new Pool({
    user: process.env.DB_USER || 'clinical_app',
    password: process.env.DB_PASSWORD || 'clinical_app_password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'clinical_system',
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Track connection state
let isConnected = false;

// Log connection status
pool.on('connect', () => {
  console.log('✅ Database connection established');
  isConnected = true;
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  isConnected = false;
});

// Test connection
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test successful');
    console.log('📅 Server time:', result.rows[0].now);
    isConnected = true;
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    console.warn('⚠️  Will use fallback authentication with hardcoded credentials');
    isConnected = false;
    return false;
  }
}

// Test connection on startup
testConnection();

// Export connection pool with fallback flag
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection,
  close: () => pool.end(),
  isConnected: () => isConnected,
};

