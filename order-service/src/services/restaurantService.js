const axios = require('axios');
const logger = require('../config/logger');

const RESTAURANT_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const TIMEOUT = parseInt(process.env.SERVICE_TIMEOUT_MS) || 5000;

class RestaurantService {
    async getRestaurantWithMenu(restaurantId) {
        try {
            const response = await axios.get(
                `${RESTAURANT_URL}/restaurants/${restaurantId}`,
                { timeout: TIMEOUT }
            );
            logger.debug('Restaurant service call successful', { restaurantId });
            return response.data.data;
        } catch (error) {
            logger.error('Restaurant service call failed', { restaurantId, error: error.message });
            throw new Error(`Failed to fetch restaurant: ${error.message}`);
        }
    }

    async validateMenuItems(restaurantId, itemIds) {
        try {
            const restaurant = await this.getRestaurantWithMenu(restaurantId);
            console.log('DEBUG: restaurantId:', restaurantId);
            console.log('DEBUG: itemIds:', JSON.stringify(itemIds));
            console.log('DEBUG: menu IDs:', JSON.stringify(restaurant.menu.map(i => i.id)));
            console.log('DEBUG: menu Raw:', JSON.stringify(restaurant.menu));
            const validItems = restaurant.menu.filter(item =>
                itemIds.some(id => id == item.id) && item.is_available
            );
            if (validItems.length !== itemIds.length) {
                console.log('DEBUG: Validation failed. Valid:', validItems.length, 'Required:', itemIds.length);
                throw new Error('Some items unavailable - DEBUG MARKER');
            }
            return validItems;
        } catch (error) {
            logger.error('Menu validation failed', { restaurantId, error: error.message });
            throw error;
        }
    }
}

module.exports = new RestaurantService();