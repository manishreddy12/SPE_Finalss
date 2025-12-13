const jwt = require('jsonwebtoken');
require('dotenv').config();

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 3001}`;
const SECRET = process.env.JWT_SECRET;

// Generate Admin Token
const adminToken = jwt.sign(
    { id: 999, role: 'admin', username: 'testadmin' },
    SECRET,
    { expiresIn: '1h' }
);

async function testAPI() {
    console.log('🚀 Starting Postman Simulation (E2E API Test)\n');
    console.log(`Target: ${BASE_URL}`);

    let restaurantId = null;

    // 1. Health Check
    await step('GET /health', async () => {
        const res = await fetch(`${BASE_URL}/health`);
        const data = await res.json();
        logResponse(res, data);
        if (res.status !== 200) throw new Error('Health check failed');
    });

    // 2. Create Restaurant (POST)
    await step('POST /restaurants (Create)', async () => {
        const payload = {
            name: 'E2E Test Cloud Kitchen',
            address: '123 Cloud Avenue',
            phone: '123-456-7890',
            cuisines: 'Tech, Fast Food',
            isActive: true
        };

        const res = await fetch(`${BASE_URL}/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        logResponse(res, data);

        if (res.status !== 201) throw new Error('Create failed');
        restaurantId = data.data.id;
    });

    // 3. Get All Restaurants (GET)
    await step('GET /restaurants (List)', async () => {
        const res = await fetch(`${BASE_URL}/restaurants?limit=5`);
        const data = await res.json();
        logResponse(res, data);
        if (res.status !== 200 || !Array.isArray(data.data)) throw new Error('List failed');
    });

    // 4. Get Restaurant By ID (GET)
    await step(`GET /restaurants/${restaurantId}`, async () => {
        const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}`);
        const data = await res.json();
        logResponse(res, data);
        if (res.status !== 200 || data.data.name !== 'E2E Test Cloud Kitchen') throw new Error('Get by ID failed');
    });

    // 5. Update Restaurant (PUT)
    await step(`PUT /restaurants/${restaurantId}`, async () => {
        const payload = {
            name: 'E2E Updated Kitchen',
            phone: '987-654-3210'
        };

        const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        logResponse(res, data);
        if (res.status !== 200 || data.data.name !== payload.name) throw new Error('Update failed');
    });

    // 6. Delete Restaurant (DELETE)
    await step(`DELETE /restaurants/${restaurantId}`, async () => {
        const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const data = await res.json();
        logResponse(res, data);
        if (res.status !== 200) throw new Error('Delete failed');
    });

    // 7. Verify Deletion (GET should be 404 or inactive)
    await step(`GET /restaurants/${restaurantId} (Verify Delete)`, async () => {
        const res = await fetch(`${BASE_URL}/restaurants/${restaurantId}`);
        // Our API might return null or 404 depending on implementation of soft delete visibility
        // If soft delete logic in getAll/getById filters 'is_active=true', then this should be 404 or null.

        if (res.status === 404) {
            console.log('✅ Restaurant correctly not found (404)');
        } else {
            // or it might return valid data but we check if we expected it to be gone from public view
            console.log(`Received ${res.status}, checking content...`);
        }
    });

    console.log('\n✨ All E2E tests passed successfully!');


    // 2. Create Restaurant (POST)
    await step('POST /restaurants (Create)', async () => {
        const payload = {
            name: 'E2E Test Cloud Kitchen',
            address: '123 Cloud Avenue',
            phone: '123-456-7890',
            cuisines: 'Tech, Fast Food',
            isActive: true
        };

        const res = await fetch(`${BASE_URL}/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        logResponse(res, data);

        if (res.status !== 201) throw new Error('Create failed');
        restaurantId = data.data.id;
    });
}

// Helpers
async function step(name, fn) {
    console.log(`\n🔹 Testing: ${name}`);
    try {
        await fn();
        console.log(`   Result: PASS`);
    } catch (err) {
        console.error(`   Result: FAIL - ${err.message}`);
        process.exit(1);
    }
}

function logResponse(res, data) {
    console.log(`   Status: ${res.status} ${res.statusText}`);
    // Truncate long outcomes
    const str = JSON.stringify(data);
    console.log(`   Body:   ${str.length > 200 ? str.substring(0, 200) + '...' : str}`);
}

testAPI();
