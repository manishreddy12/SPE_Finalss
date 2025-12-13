const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const logger = require('../config/logger');

// POST /orders - Create order
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const result = await orderController.createOrder(req.body, req.user);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// GET /orders/:id - Get order by ID
router.get('/:id', verifyToken, async (req, res, next) => {
    try {
        const result = await orderController.getOrderById(req.params.id, req.user);
        if (!result) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// GET /orders - Get user's orders
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const result = await orderController.getUserOrders(
            req.user.id,
            req.query
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// PUT /orders/:id/status - Update status (admin)
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const result = await orderController.updateOrderStatus(
            req.params.id,
            req.body.status
        );
        if (!result) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// DELETE /orders/:id - Cancel order
router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        await orderController.cancelOrder(req.params.id, req.user);
        res.json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;