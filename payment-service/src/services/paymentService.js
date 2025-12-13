const paymentModel = require('../models/payment');
const logger = require('../config/logger');
const { PAYMENT_STATUS } = require('../config/constants');

class PaymentService {
  async processPayment(paymentData) {
    try {
      const { order_id, user_id, amount, method, idempotencyKey } = paymentData;

      // Create payment record
      const payment = await paymentModel.create({
        order_id,
        user_id,
        amount,
        method,
        status: PAYMENT_STATUS.PENDING
      });

      logger.debug('Payment created', { paymentId: payment.id });

      // Simulate payment processing
      const processResult = await this.simulatePaymentGateway(payment.id, amount, method);

      if (!processResult.success) {
        await paymentModel.update(payment.id, { status: PAYMENT_STATUS.FAILED });
        throw new Error('Payment gateway failed');
      }

      // Update payment status
      await paymentModel.update(payment.id, { status: PAYMENT_STATUS.PROCESSED });
      logger.info('Payment processed', { paymentId: payment.id, amount, method });

      return await paymentModel.getById(payment.id);
    } catch (error) {
      logger.error('Payment processing failed', { error: error.message });
      throw error;
    }
  }

  async simulatePaymentGateway(paymentId, amount, method) {
    // Simulate payment gateway call
    return new Promise((resolve) => {
      setTimeout(() => {
        // 95% success rate
        const isSuccess = Math.random() > 0.05;
        resolve({ success: isSuccess, transactionId: `txn_${paymentId}_${Date.now()}` });
      }, 1000);
    });
  }
}

module.exports = new PaymentService();
