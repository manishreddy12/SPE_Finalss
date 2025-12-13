const pool = require('../config/database');
const logger = require('../config/logger');
const { FRAUD_REASONS } = require('../config/constants');

class FraudService {
  async analyzeTransaction(transaction) {
    try {
      const { user_id, amount, method, timestamp } = transaction;

      // Check 1: Amount limit
      const maxAmount = parseInt(process.env.FRAUD_MAX_TRANSACTION_AMOUNT) || 5000;
      if (amount > maxAmount) {
        return { isFraudulent: true, reason: FRAUD_REASONS.HIGH_AMOUNT };
      }

      // Check 2: Daily limit
      const dailyResult = await pool.query(
        `SELECT SUM(amount) as total_amount, COUNT(*) as count
         FROM payments
         WHERE user_id = $1
           AND DATE(created_at) = CURRENT_DATE
           AND status IN ('processed', 'settled')`,
        [user_id]
      );

      const dailyAmount = parseFloat(dailyResult.rows[0]?.total_amount || 0);
      const dailyCount = parseInt(dailyResult.rows[0]?.count || 0);
      const maxDaily = parseInt(process.env.FRAUD_MAX_DAILY_AMOUNT) || 50000;
      const maxDailyTx = parseInt(process.env.FRAUD_MAX_DAILY_TRANSACTIONS) || 10;

      if (dailyAmount + amount > maxDaily) {
        return { isFraudulent: true, reason: FRAUD_REASONS.DAILY_LIMIT };
      }

      // Check 3: Transaction velocity
      const velocityWindow = parseInt(process.env.FRAUD_VELOCITY_CHECK_WINDOW_MINUTES) || 60;
      const velocityResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM payments
         WHERE user_id = $1
           AND created_at > NOW() - INTERVAL '${velocityWindow} minutes'`,
        [user_id]
      );

      const recentCount = parseInt(velocityResult.rows[0]?.count || 0);
      if (recentCount > 5) {
        return { isFraudulent: true, reason: FRAUD_REASONS.HIGH_VELOCITY };
      }

      return { isFraudulent: false };
    } catch (error) {
      logger.error('Fraud analysis error', { error: error.message });
      return { isFraudulent: false };
    }
  }
}

module.exports = new FraudService();
