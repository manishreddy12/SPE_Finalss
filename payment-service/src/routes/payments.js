const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const logger = require('../config/logger');

// POST /payments - Process payment (idempotent)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const result = await paymentController.processPayment(
      req.body,
      req.user,
      req.idempotencyKey
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /payments/:id - Get payment status
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const result = await paymentController.getPaymentStatus(
      req.params.id,
      req.user
    );
    if (!result) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /payments/:id/refund - Refund (admin)
router.post('/:id/refund', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const result = await paymentController.refundPayment(
      req.params.id,
      req.body.reason
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /reconciliation - Payment reconciliation
router.get(
  '/reconciliation/report',
  verifyToken,
  verifyAdmin,
  async (req, res, next) => {
    try {
      const result = await paymentController.getReconciliationReport(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
