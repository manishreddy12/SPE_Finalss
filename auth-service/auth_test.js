// auth-e2e-test.js
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // npm install node-fetch@2
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SECRET = process.env.JWT_SECRET;

// Optional: generate a raw JWT to test /auth/me with a fake user if needed
const fakeUserToken = SECRET
  ? jwt.sign(
      {
        sub: '11111111-1111-1111-1111-111111111111',
        email: 'fake@example.com',
        role: 'user'
      },
      SECRET,
      { expiresIn: '1h' }
    )
  : null;

function logResponse(res, data) {
  console.log(`Status: ${res.status}`);
  console.log('Body:', JSON.stringify(data, null, 2));
  console.log('---------------------------\n');
}

async function step(name, fn) {
  console.log(`🧪 Step: ${name}`);
  await fn();
}

async function testAPI() {
  console.log('🚀 Starting Auth Service E2E API Test\n');
  console.log(`Target: ${BASE_URL}\n`);

  let jwtToken = null;
  let userId = null;

  // 1. Health Check
  await step('GET /health', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    logResponse(res, data);
    if (res.status !== 200 || data.status !== 'ok') {
      throw new Error('Health check failed');
    }
  });

  // 2. Register User (Happy Path)
  const testUserEmail = `e2e_user_${Date.now()}@example.com`;
  const testUserPassword = 'Password123!';

  await step('POST /auth/register (new user)', async () => {
    const payload = {
      name: 'E2E Test User',
      email: testUserEmail,
      password: testUserPassword,
      role: 'user'
    };

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    logResponse(res, data);
    if (res.status !== 201 || data.message !== 'User registered successfully') {
      throw new Error('User registration failed');
    }
  });

  // 3. Register User Again (Should Fail with 409)
  await step('POST /auth/register (duplicate email)', async () => {
    const payload = {
      name: 'E2E Test User Duplicate',
      email: testUserEmail,
      password: testUserPassword,
      role: 'user'
    };

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    logResponse(res, data);
    if (res.status !== 409 || data.message !== 'Email already registered') {
      throw new Error('Duplicate registration did not fail as expected');
    }
  });

  // 4. Login (Correct Credentials)
  await step('POST /auth/login (correct credentials)', async () => {
    const payload = {
      email: testUserEmail,
      password: testUserPassword
    };

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    logResponse(res, data);

    if (res.status !== 200 || !data.token || !data.user || data.user.email !== testUserEmail) {
      throw new Error('Login failed');
    }

    jwtToken = data.token;
    userId = data.user.id;
  });

  // 5. Login (Wrong Password)
  await step('POST /auth/login (wrong password)', async () => {
    const payload = {
      email: testUserEmail,
      password: 'WrongPassword!'
    };

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    logResponse(res, data);

    if (res.status !== 401 || data.message !== 'Invalid credentials') {
      throw new Error('Wrong password did not fail as expected');
    }
  });

  // 6. /auth/me without token (should 401)
  await step('GET /auth/me (no token)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    const data = await res.json();
    logResponse(res, data);

    if (res.status !== 401 || data.message !== 'Unauthorized') {
      throw new Error('/auth/me without token should be unauthorized');
    }
  });

  // 7. /auth/me with invalid token (should 401)
  await step('GET /auth/me (invalid token)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid.token.value'
      }
    });
    const data = await res.json();
    logResponse(res, data);

    if (res.status !== 401 || data.message !== 'Unauthorized') {
      throw new Error('/auth/me with invalid token should be unauthorized');
    }
  });

  // 8. /auth/me with valid token from login
  await step('GET /auth/me (valid login token)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`
      }
    });
    const data = await res.json();
    logResponse(res, data);

    if (res.status !== 200 || data.email !== testUserEmail || data.id !== userId) {
      throw new Error('Valid /auth/me failed');
    }
  });

  // 9. /auth/me with fake token (only if SECRET present)
  if (fakeUserToken) {
    await step('GET /auth/me (fake user token generated locally)', async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${fakeUserToken}`
        }
      });
      const data = await res.json();
      logResponse(res, data);

      // Depending on DB content, this might 404 if user not found
      if (res.status !== 404 && res.status !== 200) {
        throw new Error('Unexpected status for fake token /auth/me test');
      }
    });
  } else {
    console.log('Skipping fake token test (JWT_SECRET not set)\n');
  }

  // 10. /metrics smoke test
  await step('GET /metrics', async () => {
    const res = await fetch(`${BASE_URL}/metrics`);
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log('Metrics sample:\n', text.split('\n').slice(0, 10).join('\n'));
    console.log('---------------------------\n');
    if (res.status !== 200) {
      throw new Error('/metrics failed');
    }
  });

  console.log('✅ All Auth Service E2E tests completed successfully\n');
}

// Run
testAPI().catch((err) => {
  console.error('❌ E2E test failed:', err.message);
  process.exit(1);
});
