require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./src/server');
const pool = require('./src/config/database');
const redis = require('./src/config/redis');

// Generate Test Tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_min_32_chars';
const userToken = jwt.sign({ userId: 1, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
const adminToken = jwt.sign({ userId: 2, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const runTests = async () => {
    console.log('🚀 Starting E2E Tests against local environment...\n');

    try {
        // 1. Health Check
        const healthRes = await request(app).get('/health');
        if (healthRes.status === 200 && healthRes.body.status === 'ok') {
            console.log('✅ Health Check: SUCCESS');
        } else {
            console.error('❌ Health Check: FAILED', healthRes.body);
            process.exit(1);
        }

        // 2. Metrics Check
        const metricsRes = await request(app).get('/metrics');
        if (metricsRes.status === 200) {
            console.log('✅ Metrics Endpoint: SUCCESS');
        } else {
            console.error('❌ Metrics Endpoint: FAILED');
        }

        // 3. Process Payment (Happy Path)
        const paymentPayload = {
            order_id: Math.floor(Math.random() * 100000), // Random order ID
            amount: 150.00,
            method: 'credit_card'
        };

        const paymentRes = await request(app)
            .post('/payments')
            .set('Authorization', `Bearer ${userToken}`)
            .send(paymentPayload);

        if (paymentRes.status === 201 && paymentRes.body.success) {
            console.log('✅ Process Payment: SUCCESS');
        } else {
            console.error('❌ Process Payment: FAILED', paymentRes.body);
        }

        const paymentId = paymentRes.body.data?.id;

        if (paymentId) {
            // 4. Get Payment Status
            const statusRes = await request(app)
                .get(`/payments/${paymentId}`)
                .set('Authorization', `Bearer ${userToken}`);

            if (statusRes.status === 200 && statusRes.body.data.id === paymentId) {
                console.log('✅ Get Payment Status: SUCCESS');
            } else {
                console.error('❌ Get Payment Status: FAILED', statusRes.body);
            }

            // 5. Refund Payment (As Admin)
            const refundRes = await request(app)
                .post(`/payments/${paymentId}/refund`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ reason: 'E2E Test Refund' });

            if (refundRes.status === 200 && refundRes.body.data.status === 'refunded') {
                console.log('✅ Refund Payment (Admin): SUCCESS');
            } else {
                console.error('❌ Refund Payment: FAILED', refundRes.body);
            }
        }

        // 6. Reconciliation Report (Admin)
        const reportRes = await request(app)
            .get('/payments/reconciliation/report?start_date=2024-01-01')
            .set('Authorization', `Bearer ${adminToken}`);

        if (reportRes.status === 200 && reportRes.body.success) {
            console.log('✅ Reconciliation Report: SUCCESS');
        } else {
            console.error('❌ Reconciliation Report: FAILED', reportRes.body);
        }

        console.log('\n✨ All routes are successful!');

    } catch (error) {
        console.error('\n❌ An unexpected error occurred:', error);
        process.exit(1);
    } finally {
        // Cleanup connections
        await pool.end();
        if (redis.isOpen) {
            await redis.quit();
        } else if (redis.disconnect) { // Handle different redis client versions just in case
            await redis.disconnect();
        } else {
            // Force exit if redis client structure is unknown/complex, but quit() is standard for node-redis v4
            // redis.quit() was called.
        }

        // Give a small delay for connections to close cleanly
        setTimeout(() => {
            process.exit(0);
        }, 500);
    }
};

runTests();
