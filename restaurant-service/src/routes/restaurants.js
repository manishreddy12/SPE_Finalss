const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateRequest, restaurantSchema, updateRestaurantSchema } = require('../middleware/validation');

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /restaurants
 * List all restaurants with pagination and search
 * Query params: limit, offset, search
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await restaurantController.getAllRestaurants(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /restaurants/:id
 * Get a restaurant with menu items
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await restaurantController.getRestaurantById(
      req.params.id,
    );

    if (!result) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROTECTED ROUTES (Admin Only)
// ============================================

/**
 * POST /restaurants
 * Create new restaurant (admin only)
 */
router.post(
  '/',
  verifyToken,
  verifyAdmin,
  validateRequest(restaurantSchema),
  async (req, res, next) => {
    try {
      const result = await restaurantController.createRestaurant(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

/**
 * PUT /restaurants/:id
 * Update restaurant (admin only)
 */
router.put(
  '/:id',
  verifyToken,
  verifyAdmin,
  validateRequest(updateRestaurantSchema),
  async (req, res, next) => {
    try {
      const result = await restaurantController.updateRestaurant(
        req.params.id,
        req.body
      );

      if (!result) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

// DELETE /restaurants/:id - Delete restaurant (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    await restaurantController.deleteRestaurant(req.params.id);
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
router.delete('/:id', verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    await restaurantController.deleteRestaurant(req.params.id);
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
