#!/usr/bin/env node

/**
 * Phase 2.1 Setup & Test Runner
 * Run this script after PostgreSQL is installed to validate everything
 */

const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../utils/logger');

console.clear();

logger.info('╔════════════════════════════════════════════════════════════╗');
logger.info('║                                                            ║');
logger.info('║        🚀 PHASE 2.1 SETUP & TEST RUNNER 🚀               ║');
logger.info('║                                                            ║');
logger.info('╚════════════════════════════════════════════════════════════╝');
logger.info('');

const checklistItems = [
  {
    step: 1,
    name: 'PostgreSQL Installation',
    command: 'psql --version',
    description: 'Verify PostgreSQL 18+ is installed',
  },
  {
    step: 2,
    name: 'Environment Configuration',
    check: () => {
      const fs = require('fs');
      const envPath = path.join(__dirname, '../../config/.env');
      return fs.existsSync(envPath);
    },
    description: 'Verify .env file exists in config/',
  },
  {
    step: 3,
    name: 'Dependencies Installation',
    command: 'npm list pg bcryptjs dotenv',
    description: 'Verify required npm packages are installed',
  },
  {
    step: 4,
    name: 'Database Connection Test',
    command: 'node tests/database.test.js',
    description: 'Test database connectivity and schema',
  },
  {
    step: 5,
    name: 'Model Tests',
    command: 'node tests/models.test.js',
    description: 'Test database models functionality',
  },
];

async function runTests() {
  let allPassed = true;
  const results = [];

  logger.info('📋 Running Setup Checklist...\n');

  for (const item of checklistItems) {
    logger.info(`Step ${item.step}: ${item.name}`);
    logger.info(`  Description: ${item.description}`);

    try {
      if (item.command) {
        logger.info(`  Running: ${item.command}`);
        const output = execSync(item.command, { encoding: 'utf-8' });
        logger.success(`  ✅ PASSED`);
        results.push({ step: item.step, name: item.name, passed: true });
      } else if (item.check) {
        const passed = item.check();
        if (passed) {
          logger.success(`  ✅ PASSED`);
          results.push({ step: item.step, name: item.name, passed: true });
        } else {
          logger.warn(`  ❌ FAILED`);
          results.push({ step: item.step, name: item.name, passed: false });
          allPassed = false;
        }
      }
    } catch (error) {
      logger.error(`  ❌ FAILED: ${error.message}`);
      results.push({
        step: item.step,
        name: item.name,
        passed: false,
        error: error.message,
      });
      allPassed = false;
    }

    logger.info('');
  }

  // Print summary
  logger.info('════════════════════════════════════════════════════════════\n');
  logger.info('📊 TEST SUMMARY\n');

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    logger.info(`${status} Step ${result.step}: ${result.name}`);
  });

  logger.info('');

  if (allPassed) {
    logger.success(`✅ ALL CHECKS PASSED (${passedCount}/${totalCount})`);
    logger.info('');
    logger.info('🎉 Phase 2.1 is ready! You can now:');
    logger.info('  1. Run the server: npm start');
    logger.info('  2. Move to Phase 2.2: Real authentication implementation');
    logger.info('  3. Test login with database credentials');
  } else {
    logger.warn(`⚠️ SOME CHECKS FAILED (${passedCount}/${totalCount} passed)`);
    logger.info('');
    logger.info('❌ Please fix the issues and try again:');

    results.filter(r => !r.passed).forEach(result => {
      logger.info(`  • Step ${result.step}: ${result.name}`);
      if (result.error) {
        logger.info(`    Error: ${result.error}`);
      }
    });
  }

  logger.info('\n════════════════════════════════════════════════════════════\n');

  return allPassed;
}

// Run immediately
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logger.error('Unexpected error', { error: error.message });
    process.exit(1);
  });
