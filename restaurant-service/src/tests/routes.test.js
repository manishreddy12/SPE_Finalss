const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock dependencies
const restaurantModel = require('../models/restaurant');
jest.mock('../models/restaurant');
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
}));
jest.mock('../middleware/auth', () => ({
    verifyToken: (req, res, next) => {
        req.user = { role: 'admin' };
        next();
    },
    verifyAdmin: (req, res, next) => next(),
}));

// Import app components
const restaurantRoutes = require('../routes/restaurants');
const errorHandler = require('../middleware/errorHandler');

describe('Restaurant Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/restaurants', restaurantRoutes);
        app.use(errorHandler);
        jest.clearAllMocks();
    });

    describe('POST /restaurants', () => {
        const validData = {
            name: 'Test Restaurant',
            address: '123 Test St',
            phone: '123-456-7890',
            cuisines: 'Italian'
        };

        it('should create a restaurant when data is valid', async () => {
            restaurantModel.create.mockResolvedValue({ id: 1, ...validData });

            const res = await request(app)
                .post('/restaurants')
                .send(validData);

            expect(res.status).toBe(201);
            expect(restaurantModel.create).toHaveBeenCalled();
        });

        it('should fail validation when required fields are missing', async () => {
            const res = await request(app)
                .post('/restaurants')
                .send({ name: 'Only Name' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Validation failed');
            expect(restaurantModel.create).not.toHaveBeenCalled();
        });
    });

    describe('GET /restaurants/:id', () => {
        it('should return 404 if restaurant not found', async () => {
            restaurantModel.getById.mockResolvedValue(null);
            restaurantModel.getMenuByRestaurantId.mockResolvedValue([]);

            const res = await request(app).get('/restaurants/999');

            expect(res.status).toBe(404);
        });

        it('should return restaurant with menu', async () => {
            const mockRestaurant = { id: 1, name: 'Burger Joint' };
            const mockMenu = [{ id: 101, name: 'Burger', price: 10 }];

            restaurantModel.getById.mockResolvedValue(mockRestaurant);
            restaurantModel.getMenuByRestaurantId.mockResolvedValue(mockMenu);

            const res = await request(app).get('/restaurants/1');

            expect(res.status).toBe(200);
            expect(res.body.data.menu).toHaveLength(1);
        });
    });
});
