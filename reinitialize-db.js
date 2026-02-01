/**
 * Database Re-initialization Script
 * Drops all tables and reinitializes with new schema containing real demo users
 */

const fs = require('fs');
const pool = require('./src/backend/database/pool');

async function reinitializeDatabase() {
  console.log('\n╔═════════════════════════════════════════════════╗');
  console.log('║    Database Re-Initialization with Demo Users   ║');
  console.log('╚═════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Drop all tables in reverse order of dependencies
    console.log('📋 Step 1: Dropping existing tables...');
    const dropQueries = [
      'DROP TABLE IF EXISTS system_logs CASCADE',
      'DROP TABLE IF EXISTS audit_log CASCADE',
      'DROP TABLE IF EXISTS lab_tests CASCADE',
      'DROP TABLE IF EXISTS prescriptions CASCADE',
      'DROP TABLE IF EXISTS consultations CASCADE',
      'DROP TABLE IF EXISTS appointments CASCADE',
      'DROP TABLE IF EXISTS patients CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
    ];

    for (const query of dropQueries) {
      await pool.query(query);
      console.log('   ✅ ' + query.split(' ')[2]);
    }

    // Step 2: Read and execute schema
    console.log('\n📋 Step 2: Creating tables from schema.sql...');
    const schemaPath = require('path').join(__dirname, 'src/backend/database/schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf-8');

    // Remove comments
    schema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split by semicolons more carefully
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && stmt.length > 10);

    console.log(`   Found ${statements.length} SQL statements\n`);

    let tableCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        await pool.query(statement);
        if (statement.includes('CREATE TABLE')) {
          tableCount++;
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || '?';
          console.log(`   ✅ Table ${i + 1}: ${tableName}`);
        }
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`   ⚠️  Statement ${i + 1}: ${err.message.substring(0, 60)}`);
        }
      }
    }

    console.log(`\n   ✅ ${tableCount} tables created/updated`);

    // Step 3: Verify demo users
    console.log('\n📋 Step 3: Verifying demo users...');
    const usersResult = await pool.query('SELECT id, email, role FROM users ORDER BY id');
    console.log(`   ✅ Found ${usersResult.rows.length} demo users:`);
    usersResult.rows.forEach(user => {
      console.log(`      • ${user.email} (${user.role})`);
    });

    // Step 4: Verify patients
    console.log('\n📋 Step 4: Verifying demo patients...');
    const patientsResult = await pool.query('SELECT id, mrn, user_id FROM patients');
    console.log(`   ✅ Found ${patientsResult.rows.length} demo patients:`);
    patientsResult.rows.forEach(patient => {
      console.log(`      • MRN: ${patient.mrn} (User ID: ${patient.user_id})`);
    });

    console.log('\n╔═════════════════════════════════════════════════╗');
    console.log('║             ✅ INITIALIZATION COMPLETE          ║');
    console.log('╚═════════════════════════════════════════════════╝\n');
    console.log('✨ Ready to test appointment feature!');
    console.log('\n📝 Demo Credentials:');
    console.log('   • admin@clinic.com / admin123');
    console.log('   • doctor@clinic.com / doctor123');
    console.log('   • nurse@clinic.com / nurse123');
    console.log('   • patient@clinic.com / patient123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ INITIALIZATION FAILED:', error);
    process.exit(1);
  }
}

reinitializeDatabase();
