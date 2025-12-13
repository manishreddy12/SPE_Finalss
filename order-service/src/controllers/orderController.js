const orderModel = require('../models/order');
const orderService = require('../services/orderService');
const logger = require('../config/logger');
const { ORDER_STATUS } = require('../config/constants');

class OrderController {
  async createOrder(data, user) {
    try {
      const { items, restaurant_id, payment_method } = data;
      if (!items || !restaurant_id) {
        throw new Error('Missing required fields');
      }
      // Call order service (handles saga, validation)
      const order = await orderService.createOrder({
        items,
        restaurant_id,
        user_id: user.id,
        payment_method
      });
      logger.info('Order created', { orderId: order.id, userId: user.id, restaurantId: restaurant_id });
      return { success: true, data: order };
    } catch (error) {
      logger.error('Error creating order', { error: error.message });
      throw error;
    }
  }

  async getOrderById(id, user) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid order ID');
      }
      const order = await orderModel.getById(parseInt(id));
      if (!order) return null;
      // Authorization check
      if (user.role !== 'admin' && order.user_id !== user.id) {
        throw new Error('Unauthorized');
      }
      logger.info('Order fetched', { orderId: id, userId: user.id });
      return { success: true, data: order };
    } catch (error) {
      logger.error('Error fetching order', { orderId: id, error: error.message });
      throw error;
    }
  }

  async getUserOrders(userId, query) {
    try {
      const { limit = 20, offset = 0, status } = query;
      const orders = await orderModel.getByUserId(userId, {
        limit: Math.min(parseInt(limit), 100),
        offset: parseInt(offset),
        status
      });
      logger.info('User orders fetched', { userId, count: orders.length });
      return { success: true, data: orders, pagination: { limit, offset } };
    } catch (error) {
      logger.error('Error fetching user orders', { userId, error: error.message });
      throw error;
    }
  }

  async updateOrderStatus(id, newStatus) {
    try {
      if (!newStatus || !Object.values(ORDER_STATUS).includes(newStatus)) {
        throw new Error('Invalid order status');
      }
      const updated = await orderService.updateOrderStatus(
        parseInt(id),
        newStatus
      );
      if (!updated) return null;
      logger.info('Order status updated', { orderId: id, newStatus });
      return { success: true, data: updated };
    } catch (error) {
      logger.error('Error updating order status', { orderId: id, error: error.message });
      throw error;
    }
  }

  async cancelOrder(id, user) {
    try {
      const order = await orderModel.getById(parseInt(id));
      if (!order) throw new Error('Order not found');
      if (user.role !== 'admin' && order.user_id !== user.id) {
        throw new Error('Unauthorized');
      }
      await orderModel.update(parseInt(id), { status: ORDER_STATUS.CANCELLED });
      logger.info('Order cancelled', { orderId: id, userId: user.id });
    } catch (error) {
      logger.error('Error cancelling order', { orderId: id, error: error.message });
      throw error;
    }
  }
}

module.exports = new OrderController();