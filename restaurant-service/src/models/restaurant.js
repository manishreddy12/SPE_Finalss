const pool = require('../config/database');
const logger = require('../config/logger');

// ============================================
// RESTAURANT MODEL CLASS
// ============================================
class RestaurantModel {
  /**
   * Get all active restaurants with pagination and search
   */
  async getAll(options) {
    const { limit = 20, offset = 0, search = '' } = options;

    let query = `
      SELECT * FROM restaurants
      WHERE is_active = true
    `;

    const params = [];

    if (search) {
      query += ` AND (name ILIKE $1 OR cuisines ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += `
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Database error in getAll', { error: error.message });
      throw error;
    }
  }

  /**
   * Get restaurant by ID
   */
  async getById(id) {
    const query = `
      SELECT * FROM restaurants
      WHERE id = $1 AND is_active = true
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Database error in getById', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get menu items for a restaurant
   */
  async getMenuByRestaurantId(restaurantId) {
    const query = `
      SELECT id, name, description, price, category, is_available
      FROM menu_items
      WHERE restaurant_id = $1 AND is_available = true
      ORDER BY category, name
    `;

    try {
      const result = await pool.query(query, [restaurantId]);
      return result.rows;
    } catch (error) {
      logger.error('Database error in getMenuByRestaurantId', {
        restaurantId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create new restaurant
   */
  async create(data) {
    const { name, address, phone, cuisines } = data;

    const query = `
      INSERT INTO restaurants (name, address, phone, cuisines, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, address, phone, cuisines, is_active, created_at
    `;

    try {
      const result = await pool.query(query, [
        name,
        address,
        phone,
        cuisines,
        true,
      ]);

      return result.rows[0];
    } catch (error) {
      logger.error('Database error in create', { error: error.message });
      throw error;
    }
  }

  /**
   * Update restaurant by ID
   */
  async update(id, data) {
    const { name, address, phone, cuisines, isActive } = data;

    const query = `
      UPDATE restaurants
      SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        phone = COALESCE($3, phone),
        cuisines = COALESCE($4, cuisines),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, address, phone, cuisines, is_active, updated_at
    `;

    try {
      const result = await pool.query(query, [
        name,
        address,
        phone,
        cuisines,
        isActive,
        id,
      ]);

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Database error in update', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete (soft delete) restaurant by ID
   */
  async delete(id) {
    const query = `
      UPDATE restaurants
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `;

    try {
      await pool.query(query, [id]);
    } catch (error) {
      logger.error('Database error in delete', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new RestaurantModel();
