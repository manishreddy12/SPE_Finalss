const pool = require('../config/database');
const logger = require('../config/logger');

class PaymentModel {
  async getById(id) {
    const query = `
      SELECT id, order_id, user_id, amount, method, status, fraud_reason, created_at, updated_at
      FROM payments
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('DB error in getById', { paymentId: id, error: error.message });
      throw error;
    }
  }

  async create(data) {
    const { order_id, user_id, amount, method, status, fraud_reason } = data;

    const query = `
      INSERT INTO payments (order_id, user_id, amount, method, status, fraud_reason, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, order_id, user_id, amount, method, status, created_at
    `;

    try {
      const result = await pool.query(query, [
        order_id,
        user_id,
        amount,
        method,
        status,
        fraud_reason
      ]);
      return result.rows[0];
    } catch (error) {
      logger.error('DB error in create', { error: error.message });
      throw error;
    }
  }

  async update(id, data) {
    const { status, refund_reason } = data;

    const query = `
      UPDATE payments
      SET
        status = COALESCE($1, status),
        refund_reason = COALESCE($2, refund_reason),
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, order_id, user_id, amount, method, status, updated_at
    `;

    try {
      const result = await pool.query(query, [status, refund_reason, id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('DB error in update', { paymentId: id, error: error.message });
      throw error;
    }
  }
}

module.exports = new PaymentModel();
