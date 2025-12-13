const pool = require('../config/database');
const logger = require('../config/logger');

class OrderModel {
    async getById(id) {
        const query = `
      SELECT id, user_id, restaurant_id, items, total_price, status, payment_method, created_at, updated_at
      FROM orders
      WHERE id = $1
    `;
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('DB error in getById', { orderId: id, error: error.message });
            throw error;
        }
    }

    async getByUserId(userId, options) {
        const { limit = 20, offset = 0, status } = options;
        let query = `
      SELECT id, user_id, restaurant_id, items, total_price, status, payment_method, created_at, updated_at
      FROM orders
      WHERE user_id = $1
    `;
        const params = [userId];
        if (status) {
            query += ' AND status = $2';
            params.push(status);
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            logger.error('DB error in getByUserId', { userId, error: error.message });
            throw error;
        }
    }

    async create(data) {
        const { user_id, restaurant_id, items, total_price, payment_method } = data;
        const query = `
      INSERT INTO orders (user_id, restaurant_id, items, total_price, status, payment_method, created_at)
      VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
      RETURNING id, user_id, restaurant_id, items, total_price, status, payment_method, created_at
    `;
        try {
            const result = await pool.query(query, [
                user_id,
                restaurant_id,
                JSON.stringify(items),
                total_price,
                payment_method
            ]);
            return result.rows[0];
        } catch (error) {
            logger.error('DB error in create', { error: error.message });
            throw error;
        }
    }

    async update(id, data) {
        const { status, items, total_price } = data;
        const query = `
      UPDATE orders
      SET status = COALESCE($1, status),
          items = COALESCE($2, items),
          total_price = COALESCE($3, total_price),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, user_id, restaurant_id, items, total_price, status, updated_at
    `;
        try {
            const result = await pool.query(query, [
                status,
                items ? JSON.stringify(items) : null,
                total_price,
                id
            ]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('DB error in update', { orderId: id, error: error.message });
            throw error;
        }
    }
}

module.exports = new OrderModel();