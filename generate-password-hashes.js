/**
 * Generate bcrypt hashes for demo user passwords
 */

const bcrypt = require('bcrypt');

const passwords = {
  'admin123': 'admin@clinic.com (administrator)',
  'doctor123': 'doctor@clinic.com (doctor)',
  'nurse123': 'nurse@clinic.com (nurse)',
  'patient123': 'patient@clinic.com (patient)',
};

async function generateHashes() {
  console.log('\n╔═════════════════════════════════════════════════╗');
  console.log('║   Bcrypt Password Hash Generator for Demo Users ║');
  console.log('╚═════════════════════════════════════════════════╝\n');

  for (const [password, email] of Object.entries(passwords)) {
    try {
      const hash = await bcrypt.hash(password, 10);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`Hash: ${hash}`);
      console.log('---');
    } catch (error) {
      console.error(`Error hashing ${password}:`, error.message);
    }
  }

  console.log('\nUse these hashes in your SQL INSERT statements above.');
}

generateHashes();
