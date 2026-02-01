#!/usr/bin/env node
/**
 * Database Connection Test Script
 * Verifies that the clinical_system database is properly configured
 */

const { Pool } = require('pg');

const pool = new Pool({
  user: 'clinical_app',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'clinical_system',
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('📅 Server time:', result.rows[0].now);
    
    // Verify tables exist
    console.log('\n🔄 Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.table_name}`);
    });
    
    // Count demo data
    console.log('\n🔄 Checking demo data...');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users in database: ${usersResult.rows[0].count}`);
    
    // List users
    const userListResult = await pool.query('SELECT id, email, first_name, last_name, role FROM users LIMIT 5');
    console.log('\n📋 Sample users:');
    userListResult.rows.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('\n✅ Database setup verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error details:', err);
    process.exit(1);
  }
}

testConnection();
