const orderModel = require('../models/order');
const restaurantService = require('./restaurantService');
const logger = require('../config/logger');
const { ORDER_STATUS } = require('../config/constants');

class OrderService {
    async createOrder(data) {
        const { items, restaurant_id, user_id, payment_method } = data;

        try {
            // 1. Validate items with restaurant service
            // Extract item IDs from the request
            console.log('DEBUG: OrderService items:', JSON.stringify(items));
            const itemIds = items.map(item => parseInt(item.menu_item_id || item.id));
            const validItems = await restaurantService.validateMenuItems(restaurant_id, itemIds);

            // 2. Calculate total price
            let totalPrice = 0;
            items.forEach(item => {
                const itemId = parseInt(item.menu_item_id || item.id);
                const validItem = validItems.find(v => v.id == itemId);
                if (validItem) {
                    totalPrice += validItem.price * item.quantity;
                }
            });

            // 3. Create order in DB
            const order = await orderModel.create({
                user_id,
                restaurant_id,
                items, // Store the items as they were requested (snapshot)
                total_price: totalPrice,
                payment_method
            });

            logger.info('Order service created order', { orderId: order.id });
            return order;

        } catch (error) {
            logger.error('Order creation failed in service', { error: error.message });
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const order = await orderModel.update(id, { status });
            if (order) {
                logger.info('Order status updated in service', { orderId: id, status });
            }
            return order;
        } catch (error) {
            logger.error('Order status update failed in service', { orderId: id, error: error.message });
            throw error;
        }
    }
}

module.exports = new OrderService();
