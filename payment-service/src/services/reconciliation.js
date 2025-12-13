const pool = require('../config/database');
const logger = require('../config/logger');

class ReconciliationService {
  async generateReport(options) {
    try {
      const { startDate, endDate, limit = 100 } = options;

      let query = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as total_count,
          SUM(amount) as total_amount,
          COUNT(CASE WHEN status = 'processed' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'fraud_detected' THEN 1 END) as fraud
        FROM payments
        WHERE 1=1
      `;
      const params = [];

      if (startDate) {
        query += ` AND created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ` GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);

      logger.info('Reconciliation report generated', { rows: result.rows.length, startDate, endDate });

      return {
        report: result.rows,
        generated_at: new Date().toISOString(),
        summary: this.calculateSummary(result.rows)
      };
    } catch (error) {
      logger.error('Reconciliation report generation failed', { error: error.message });
      throw error;
    }
  }

  calculateSummary(rows) {
    return rows.reduce(
      (acc, row) => {
        acc.total_count += parseInt(row.total_count);
        acc.total_amount += parseFloat(row.total_amount || 0);
        acc.successful += parseInt(row.successful);
        acc.failed += parseInt(row.failed);
        acc.fraud += parseInt(row.fraud);
        return acc;
      },
      { total_count: 0, total_amount: 0, successful: 0, failed: 0, fraud: 0 }
    );
  }
}

module.exports = new ReconciliationService();
