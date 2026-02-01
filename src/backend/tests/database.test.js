/**
 * Database Connection Test Suite
 * Tests database connectivity and basic operations
 */

const db = require('../database/connection');
const { logger } = require('../utils/logger');

/**
 * Test database connection
 */
async function testConnection() {
  try {
    logger.info('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    logger.success('Database connection successful', {
      timestamp: result.rows[0],
    });
    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Test database pool
 */
async function testPool() {
  try {
    logger.info('Testing connection pool...');

    // Get pool stats
    const stats = {
      totalCount: db.pool.totalCount,
      idleCount: db.pool.idleCount,
      waitingCount: db.pool.waitingCount,
    };

    logger.success('Pool status', stats);

    // Try to get a client
    const client = await db.pool.connect();
    logger.success('Successfully obtained client from pool');

    // Release the client
    client.release();
    logger.success('Successfully released client back to pool');

    return true;
  } catch (error) {
    logger.error('Pool test failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Test schema exists
 */
async function testSchema() {
  try {
    logger.info('Testing database schema...');

    const query = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const result = await db.query(query);
    const tables = result.rows.map(row => row.table_name);

    logger.success('Database tables found', {
      count: tables.length,
      tables: tables,
    });

    // Check for required tables
    const requiredTables = ['users', 'patients', 'appointments', 'consultations'];
    const missingTables = requiredTables.filter(t => !tables.includes(t));

    if (missingTables.length > 0) {
      logger.warn('Missing required tables', { missing: missingTables });
      return false;
    }

    logger.success('All required tables present');
    return true;
  } catch (error) {
    logger.error('Schema test failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Test sample data query
 */
async function testSampleQuery() {
  try {
    logger.info('Testing sample query...');

    const query = `
      SELECT COUNT(*) as user_count FROM users;
    `;

    const result = await db.query(query);
    logger.success('Sample query executed', {
      userCount: result.rows[0].user_count,
    });

    return true;
  } catch (error) {
    logger.error('Sample query test failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  logger.info('🚀 Starting Database Test Suite...\n');

  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Pool Test', fn: testPool },
    { name: 'Schema Test', fn: testSchema },
    { name: 'Sample Query Test', fn: testSampleQuery },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({
        name: test.name,
        passed,
        status: passed ? '✅ PASSED' : '❌ FAILED',
      });
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        status: '❌ ERROR',
        error: error.message,
      });
    }
  }

  // Print summary
  logger.info('\n📋 Test Results Summary:\n');
  results.forEach(result => {
    logger.info(`${result.status}: ${result.name}`, result.error ? { error: result.error } : {});
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  if (passedCount === totalCount) {
    logger.success(`\n✅ All tests passed (${passedCount}/${totalCount})`);
  } else {
    logger.warn(`\n⚠️ Some tests failed (${passedCount}/${totalCount} passed)`);
  }

  return passedCount === totalCount;
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unexpected error in test suite', { error: error.message });
      process.exit(1);
    });
}

module.exports = {
  testConnection,
  testPool,
  testSchema,
  testSampleQuery,
  runAllTests,
};
