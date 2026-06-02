const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper for delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n==================================================');
  console.log('🛸 STARTING AUTOMATED QA REGRESSION TESTS');
  console.log('==================================================\n');

  let testPassed = 0;
  let testFailed = 0;

  function printResult(name, success, info = '') {
    if (success) {
      testPassed++;
      console.log(`✅ [PASS] ${name} ${info ? `(${info})` : ''}`);
    } else {
      testFailed++;
      console.log(`❌ [FAIL] ${name} ${info ? `- ${info}` : ''}`);
    }
  }

  // Helper to fetch
  async function apiFetch(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();
      return { status: response.status, data, ok: response.ok };
    } catch (err) {
      return { status: 500, data: err.message, ok: false };
    }
  }

  // 1. Verify Health Check
  try {
    const res = await apiFetch('/health');
    printResult('1. System Health API (/health)', res.ok && res.data?.status === 'OK', `Status: ${res.status}`);
  } catch (e) {
    printResult('1. System Health API (/health)', false, e.message);
  }

  // 2. Verify Database Connection Endpoint
  try {
    const res = await apiFetch('/api/system/check-connection');
    printResult('2. Database Connection API (/api/system/check-connection)', res.ok && res.data?.data?.status === 'connected', `Database: ${res.data?.data?.database || 'Unknown'}`);
  } catch (e) {
    printResult('2. Database Connection API (/api/system/check-connection)', false, e.message);
  }

  // 3. Verify AI Symptom Checker Route is Protected (Unauthenticated block)
  try {
    const res = await apiFetch('/api/ai/analyze-symptoms', 'POST', { symptoms: 'fever' });
    const isProtected = res.status === 401;
    printResult('3. Security Check: AI Symptoms Checker requires Authentication', isProtected, `Blocked as expected with Status: ${res.status}`);
  } catch (e) {
    printResult('3. Security Check: AI Symptoms Checker requires Authentication', false, e.message);
  }

  // 4. Verify Auth Login with Demo Account
  let token = null;
  try {
    // Attempting login with demo patient
    const res = await apiFetch('/api/auth/login', 'POST', {
      email: 'patient@clinic.com',
      password: 'patient'
    });
    
    if (res.ok && res.data?.token) {
      token = res.data.token;
      printResult('4. Authentication Flow (Demo Patient Login)', true, `Role: ${res.data.user?.role}`);
    } else {
      printResult('4. Authentication Flow (Demo Patient Login)', false, res.data?.message || 'Token missing');
    }
  } catch (e) {
    printResult('4. Authentication Flow (Demo Patient Login)', false, e.message);
  }

  // 5. Verify Authenticated AI Symptom Checker (Token verification)
  if (token) {
    try {
      const res = await apiFetch('/api/ai/analyze-symptoms', 'POST', {
        symptoms: 'Mild fever and dry cough for 2 days',
        language: 'en'
      }, token);

      const isValidAiResponse = res.ok && res.data?.data?.severityLevel !== undefined;
      printResult(
        '5. Protected AI Symptom Checker (Authenticated Request)', 
        isValidAiResponse, 
        isValidAiResponse 
          ? `Severity: ${res.data.data.severityLevel}, Specialist: ${res.data.data.recommendedSpecialist}`
          : res.data?.message || 'Invalid format'
      );
    } catch (e) {
      printResult('5. Protected AI Symptom Checker (Authenticated Request)', false, e.message);
    }
  } else {
    printResult('5. Protected AI Symptom Checker (Authenticated Request)', false, 'Skipped (No authentication token available)');
  }

  // 6. Verify Logged-in User Profile retrieval
  if (token) {
    try {
      const res = await apiFetch('/api/auth/me', 'GET', null, token);
      const matchesEmail = res.ok && res.data?.data?.email === 'patient@clinic.com';
      printResult('6. User Session Integrity Check (/api/auth/me)', matchesEmail, `Email matches: ${matchesEmail}`);
    } catch (e) {
      printResult('6. User Session Integrity Check (/api/auth/me)', false, e.message);
    }
  } else {
    printResult('6. User Session Integrity Check (/api/auth/me)', false, 'Skipped (No authentication token)');
  }

  // 7. Verify Booked Slots retrieval (appointments API)
  if (token) {
    try {
      const res = await apiFetch('/api/appointments/booked-slots/3/2026-03-09', 'GET', null, token);
      printResult('7. Appointments Booking Slots Fetch', res.ok && res.data?.data?.bookedSlots !== undefined, `Slots Count: ${res.data?.data?.bookedSlots?.length || 0}`);
    } catch (e) {
      printResult('7. Appointments Booking Slots Fetch', false, e.message);
    }
  } else {
    printResult('7. Appointments Booking Slots Fetch', false, 'Skipped (No authentication token)');
  }

  console.log('\n==================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log(`Passed: ${testPassed}/${testPassed + testFailed}`);
  console.log(`Failed: ${testFailed}/${testPassed + testFailed}`);
  console.log('==================================================\n');

  return testFailed === 0;
}

// Check if server is running, if not, spawn it locally first, run tests, and shutdown.
async function init() {
  try {
    const health = await fetch(`${BASE_URL}/health`).catch(() => null);
    if (health && health.ok) {
      console.log('🤖 Existing server running on port 5000 detected. Commencing tests.');
      const success = await runTests();
      process.exit(success ? 0 : 1);
    } else {
      console.log('🚀 Spawning local server instance for tests...');
      const server = spawn('node', ['server.js'], {
        env: { ...process.env, PORT: PORT, NODE_ENV: 'development' },
        stdio: 'inherit'
      });

      // Wait for server to bind
      await sleep(3500);

      const success = await runTests();
      
      console.log('👋 Terminating spawned server instance.');
      server.kill();
      process.exit(success ? 0 : 1);
    }
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

init();
