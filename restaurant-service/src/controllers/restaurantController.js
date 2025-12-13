const restaurantModel = require('../models/restaurant');
const logger = require('../config/logger');

// ============================================
// RESTAURANT CONTROLLER CLASS
// ============================================
class RestaurantController {
  /**
   * Get all restaurants with pagination and search
   */
  async getAllRestaurants(query) {
    try {
      const { limit = 20, offset = 0, search } = query;

      const restaurants = await restaurantModel.getAll({
        limit: Math.min(parseInt(limit, 10), 100),
        offset: parseInt(offset, 10),
        search,
      });

      logger.info('Fetched restaurants list', {
        count: restaurants.length,
        limit,
        offset,
      });

      return {
        success: true,
        data: restaurants,
        pagination: { limit, offset },
      };
    } catch (error) {
      logger.error('Error fetching restaurants', { error: error.message });
      throw error;
    }
  }

  /**
   * Get restaurant by ID with menu
   */
  async getRestaurantById(id) {
    try {
      if (!id || isNaN(parseInt(id, 10))) {
        throw new Error('Invalid restaurant ID');
      }

      const restaurant = await restaurantModel.getById(parseInt(id, 10));
      const menu = await restaurantModel.getMenuByRestaurantId(
        parseInt(id, 10),
      );

      if (!restaurant) {
        return null;
      }

      logger.info('Fetched restaurant details', { restaurantId: id });

      return {
        success: true,
        data: { ...restaurant, menu },
      };
    } catch (error) {
      logger.error('Error fetching restaurant', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create new restaurant
   */
  async createRestaurant(data) {
    try {
      const { name, address, phone, cuisines } = data;

      if (!name || !address || !phone) {
        throw new Error('Missing required fields');
      }

      const restaurant = await restaurantModel.create({
        name,
        address,
        phone,
        cuisines: cuisines || 'Multi-cuisine',
        isActive: true,
      });

      logger.info('Restaurant created', {
        restaurantId: restaurant.id,
        name,
      });

      return { success: true, data: restaurant };
    } catch (error) {
      logger.error('Error creating restaurant', { error: error.message });
      throw error;
    }
  }

  /**
   * Update restaurant by ID
   */
  async updateRestaurant(id, data) {
    try {
      if (!id || isNaN(parseInt(id, 10))) {
        throw new Error('Invalid restaurant ID');
      }

      const updated = await restaurantModel.update(parseInt(id, 10), data);

      if (!updated) {
        return null;
      }

      logger.info('Restaurant updated', { restaurantId: id });

      return { success: true, data: updated };
    } catch (error) {
      logger.error('Error updating restaurant', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete restaurant by ID
   */
  async deleteRestaurant(id) {
    try {
      if (!id || isNaN(parseInt(id, 10))) {
        throw new Error('Invalid restaurant ID');
      }

      await restaurantModel.delete(parseInt(id, 10));

      logger.info('Restaurant deleted', { restaurantId: id });

      return { success: true };
    } catch (error) {
      logger.error('Error deleting restaurant', {
        restaurantId: id,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new RestaurantController();
