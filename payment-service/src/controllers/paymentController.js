const paymentModel = require('../models/payment');
const paymentService = require('../services/paymentService');
const fraudService = require('../services/fraudService');
const reconciliationService = require('../services/reconciliation');
const logger = require('../config/logger');
const { PAYMENT_STATUS } = require('../config/constants');

class PaymentController {
  async processPayment(data, user, idempotencyKey) {
    try {
      const { order_id, amount, method } = data;

      if (!order_id || !amount || !method) {
        throw new Error('Missing required fields');
      }

      if (amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Fraud detection
      const fraudCheck = await fraudService.analyzeTransaction({
        user_id: user.id,
        amount,
        method,
        timestamp: new Date()
      });

      if (fraudCheck.isFraudulent) {
        logger.warn('Fraud detected', {
          userId: user.id,
          orderId: order_id,
          reason: fraudCheck.reason
        });

        const payment = await paymentModel.create({
          order_id,
          user_id: user.id,
          amount,
          method,
          status: PAYMENT_STATUS.FRAUD_DETECTED,
          fraud_reason: fraudCheck.reason
        });

        return {
          success: false,
          data: payment,
          error: 'Transaction flagged as fraudulent'
        };
      }

      // Process payment
      const payment = await paymentService.processPayment({
        order_id,
        user_id: user.id,
        amount,
        method,
        idempotencyKey
      });

      logger.info('Payment processed successfully', {
        paymentId: payment.id,
        orderId: order_id,
        amount,
        userId: user.id
      });

      return { success: true, data: payment };
    } catch (error) {
      logger.error('Error processing payment', { error: error.message });
      throw error;
    }
  }

  async getPaymentStatus(paymentId, user) {
    try {
      const payment = await paymentModel.getById(parseInt(paymentId));
      if (!payment) return null;

      // Authorization
      if (user.role !== 'admin' && payment.user_id !== user.id) {
        throw new Error('Unauthorized');
      }

      return { success: true, data: payment };
    } catch (error) {
      logger.error('Error fetching payment', { error: error.message });
      throw error;
    }
  }

  async refundPayment(paymentId, reason) {
    try {
      const payment = await paymentModel.getById(parseInt(paymentId));
      if (!payment) throw new Error('Payment not found');

      if (payment.status === PAYMENT_STATUS.REFUNDED) {
        throw new Error('Already refunded');
      }

      const refunded = await paymentModel.update(parseInt(paymentId), {
        status: PAYMENT_STATUS.REFUNDED,
        refund_reason: reason
      });

      logger.info('Payment refunded', { paymentId, reason });

      return { success: true, data: refunded };
    } catch (error) {
      logger.error('Error refunding payment', { error: error.message });
      throw error;
    }
  }

  async getReconciliationReport(query) {
    try {
      const report = await reconciliationService.generateReport({
        startDate: query.start_date,
        endDate: query.end_date,
        limit: parseInt(query.limit) || 100
      });

      return { success: true, data: report };
    } catch (error) {
      logger.error('Error generating reconciliation report', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new PaymentController();
