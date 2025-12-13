const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  SETTLED: 'settled',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  FRAUD_DETECTED: 'fraud_detected'
};

const FRAUD_REASONS = {
  HIGH_AMOUNT: 'amount_exceeds_limit',
  HIGH_VELOCITY: 'high_transaction_velocity',
  DAILY_LIMIT: 'daily_limit_exceeded',
  UNUSUAL_PATTERN: 'unusual_pattern_detected'
};

const PAYMENT_METHODS = ['credit_card', 'debit_card', 'upi', 'wallet'];

module.exports = {
  PAYMENT_STATUS,
  FRAUD_REASONS,
  PAYMENT_METHODS
};
