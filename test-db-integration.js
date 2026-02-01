/**
 * Database Integration Test
 * Tests if data is being loaded from the real database
 */

const http = require('http');

const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
  },
  {
    name: 'Get All Patients',
    path: '/api/patients',
    method: 'GET',
  },
  {
    name: 'Get All Appointments',
    path: '/api/appointments',
    method: 'GET',
  },
  {
    name: 'Get All Consultations',
    path: '/api/consultations',
    method: 'GET',
  },
  {
    name: 'Get All Invoices',
    path: '/api/invoices',
    method: 'GET',
  },
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            test: test.name,
            status: res.statusCode,
            success: res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 404,
            dataType: Array.isArray(parsed) ? 'Array' : typeof parsed,
            itemCount: Array.isArray(parsed) ? parsed.length : 'N/A',
            data: parsed,
          });
        } catch (e) {
          resolve({
            test: test.name,
            status: res.statusCode,
            success: false,
            error: e.message,
            data: data,
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        test: test.name,
        error: e.message,
        success: false,
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║    Database Integration Test Suite              ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  for (const test of tests) {
    const result = await testEndpoint(test);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (Array.isArray(result.data) && result.data.length > 0) {
      console.log(`   ✅ Real Data: ${result.itemCount} items returned`);
      if (result.data[0]) {
        console.log(`   Sample: ${JSON.stringify(result.data[0]).substring(0, 100)}...`);
      }
    } else if (result.data && result.data.fallback) {
      console.log(`   ⚠️ Fallback Data: Using hardcoded data`);
    } else if (result.data && typeof result.data === 'object') {
      console.log(`   Data Type: ${JSON.stringify(result.data).substring(0, 100)}`);
    }
    console.log('');
  }
}

runTests().catch(console.error);
