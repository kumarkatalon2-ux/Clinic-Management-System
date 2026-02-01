/**
 * Model Test Suite
 * Tests database models
 */

const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { logger } = require('../utils/logger');

/**
 * Test User model
 */
async function testUserModel() {
  try {
    logger.info('Testing User model...');

    // Try to find an existing user (demo user from schema)
    const user = await User.findByEmail('doctor@example.com');

    if (user) {
      logger.success('User model working - found user', {
        email: user.email,
        role: user.role,
      });
      return true;
    } else {
      logger.warn('No demo user found - schema may not be initialized');
      return false;
    }
  } catch (error) {
    logger.error('User model test failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Test Patient model
 */
async function testPatientModel() {
  try {
    logger.info('Testing Patient model...');

    // Try to list patients
    const result = await Patient.listPatients(1, 0);

    logger.success('Patient model working', {
      totalPatients: result.total,
      returnedCount: result.patients.length,
    });
    return true;
  } catch (error) {
    logger.error('Patient model test failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Test Appointment model
 */
async function testAppointmentModel() {
  try {
    logger.info('Testing Appointment model...');

    // Try to get appointments by status
    const result = await Appointment.getByStatus('scheduled', 1, 0);

    logger.success('Appointment model working', {
      totalAppointments: result.total,
      returnedCount: result.appointments.length,
    });
    return true;
  } catch (error) {
    logger.error('Appointment model test failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Run all model tests
 */
async function runAllModelTests() {
  logger.info('🚀 Starting Model Test Suite...\n');

  const tests = [
    { name: 'User Model', fn: testUserModel },
    { name: 'Patient Model', fn: testPatientModel },
    { name: 'Appointment Model', fn: testAppointmentModel },
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
  logger.info('\n📋 Model Test Results Summary:\n');
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
  runAllModelTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Unexpected error in test suite', { error: error.message });
      process.exit(1);
    });
}

module.exports = {
  testUserModel,
  testPatientModel,
  testAppointmentModel,
  runAllModelTests,
};
