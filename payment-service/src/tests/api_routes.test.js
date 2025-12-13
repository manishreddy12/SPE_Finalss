const request = require('supertest');
const app = require('../server');
const { PAYMENT_STATUS } = require('../config/constants');

// MOCK DEPENDENCIES
jest.mock('../config/database', () => ({
    query: jest.fn(),
    end: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
    Pool: jest.fn(() => ({
        query: jest.fn(),
        connect: jest.fn(),
        on: jest.fn(),
        end: jest.fn()
    }))
}));

jest.mock('../config/redis', () => ({
    connect: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    v4: {
        connect: jest.fn(),
        quit: jest.fn()
    }
}));

jest.mock('../config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    http: jest.fn(),
    debug: jest.fn()
}));

// Mock Auth Middleware to bypass authentication
jest.mock('../middleware/auth', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 1, role: 'user' }; // Mock a regular user
        next();
    },
    verifyAdmin: (req, res, next) => {
        // Check if we want to simulate admin for specific tests, or just allow all
        // For simplicity, let's assume the previous middleware set req.user
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            // If the test didn't set role to admin (we can override in test), deny?
            // Actually, let's just bypass verifyAdmin too for simplicity in structure checks,
            // or we can strictly test it.
            // Let's make it smarter: logic inside test will decide permissions.
            // But since we can't easily change the mock per test without complex setup, 
            // let's just say verifyToken adds a user, and we will mock verifyAdmin to pass always
            // UNLESS we specifically want to test 403.
            // For "route working" verification, passing is fine.
            next();
        }
    }
}));

// Mock Services/Controllers if needed, but integration with controller is better.
// However, controller calls Services, which call Models, which call DB.
// So we need to mock Models/Services or DB.
// Mocking DB is 'deep' integration. Mocking Services is 'shallow'.
// Let's mock the Service layer to avoid complex DB query mocking.

jest.mock('../services/paymentService', () => ({
    processPayment: jest.fn().mockResolvedValue({ id: 999, status: 'processed' })
}));

jest.mock('../services/fraudService', () => ({
    analyzeTransaction: jest.fn().mockResolvedValue({ isFraudulent: false })
}));

jest.mock('../services/reconciliation', () => ({
    generateReport: jest.fn().mockResolvedValue({ total_processed: 100 })
}));

jest.mock('../models/payment', () => ({
    create: jest.fn(),
    getById: jest.fn().mockImplementation((id) => {
        if (id === 1) return Promise.resolve({ id: 1, user_id: 1, status: 'completed' });
        return Promise.resolve(null);
    }),
    update: jest.fn().mockResolvedValue({ id: 1, status: 'refunded' })
}));


describe('API Route Verification', () => {

    describe('GET /health', () => {
        it('should return 200 OK', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        });
    });

    describe('GET /metrics', () => {
        it('should return 200 OK and text content', async () => {
            const res = await request(app).get('/metrics');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toContain('text/plain');
        });
    });

    describe('POST /payments', () => {
        it('should process a valid payment', async () => {
            const res = await request(app)
                .post('/payments')
                .send({ order_id: 123, amount: 50, method: 'card' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should fail with 400/500 if missing data (controller validation)', async () => {
            // Controller throws "Missing required fields" -> catch -> next(error) -> errorHandler
            // We assume errorHandler returns 500 or 400.
            const res = await request(app)
                .post('/payments')
                .send({ order_id: 123 }); // missing amount/method

            expect(res.status).not.toBe(200);
            expect(res.status).not.toBe(201);
            // Likely 500 or 400 depending on error handler implementation details
        });
    });

    describe('GET /payments/:id', () => {
        it('should return payment details for existing payment', async () => {
            const res = await request(app).get('/payments/1');
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(1);
        });

        it('should return 404 for non-existent payment', async () => {
            const res = await request(app).get('/payments/999');
            expect(res.status).toBe(404);
        });
    });

    describe('POST /payments/:id/refund', () => {
        it('should process refund', async () => {
            const res = await request(app)
                .post('/payments/1/refund')
                .send({ reason: 'defective' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /payments/reconciliation/report', () => {
        it('should return report', async () => {
            const res = await request(app)
                .get('/payments/reconciliation/report?start_date=2024-01-01');

            expect(res.status).toBe(200);
            expect(res.body.data.total_processed).toBe(100);
        });
    });

});
