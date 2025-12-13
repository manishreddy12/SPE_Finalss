const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:4000';
const SECRET = 'changeme';

const token = jwt.sign({ id: 1, role: 'admin' }, SECRET);
const headers = { Authorization: `Bearer ${token}` };

async function testEndpoints() {
    console.log('Starting API Tests...\n');

    // 1. Health Check
    try {
        const res = await axios.get(`${BASE_URL}/health`);
        console.log('✅ /health:', res.status, res.data);
    } catch (err) {
        console.log('❌ /health failed:', err.message);
        if (err.response) console.log(err.response.data);
    }

    // 2. Metrics
    try {
        const res = await axios.get(`${BASE_URL}/metrics`);
        console.log('✅ /metrics:', res.status, 'Content-Type:', res.headers['content-type']);
    } catch (err) {
        console.log('❌ /metrics failed:', err.message);
    }

    // 3. Get Orders (Empty initially)
    try {
        const res = await axios.get(`${BASE_URL}/orders`, { headers });
        console.log('✅ GET /orders:', res.status, `Count: ${res.data.data ? res.data.data.length : 0}`);
    } catch (err) {
        console.log('❌ GET /orders failed:', err.message);
        if (err.response) console.log(err.response.data);
    }

    // 4. Create Order (Mocking data)
    // Note: This might fail if DB tables aren't created or restaurant service is down.
    // We expect it to fail at the "validateMenuItems" step if restaurant service is not running.
    try {
        const orderData = {
            restaurant_id: 1,
            items: [{ id: '123', quantity: 2 }],
            payment_method: 'credit_card'
        };
        const res = await axios.post(`${BASE_URL}/orders`, orderData, { headers });
        console.log('✅ POST /orders:', res.status, res.data);
    } catch (err) {
        console.log('❌ POST /orders failed:', err.message);
        if (err.response) console.log('   Response:', err.response.data);
    }
}

testEndpoints();
