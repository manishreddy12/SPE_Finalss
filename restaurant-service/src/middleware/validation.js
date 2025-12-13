const Joi = require('joi');
const logger = require('../config/logger');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      logger.warn('Validation error', { messages });
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }

    req.body = value;
    next();
  };
};

const restaurantSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  cuisines: Joi.string().optional().max(100), // Optional in controller (defaults to Multi-cuisine), but good to allow
  address: Joi.string().required().max(500),
  phone: Joi.string().required().regex(/^[0-9\-+() ]*$/).message('Phone number allows only numbers and standard separators'),
  isActive: Joi.boolean().optional(),
});

const updateRestaurantSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  cuisines: Joi.string().optional().max(100),
  address: Joi.string().optional().max(500),
  phone: Joi.string().optional().regex(/^[0-9\-+() ]*$/).message('Phone number allows only numbers and standard separators'),
  isActive: Joi.boolean().optional(),
}).min(1); // Ensure at least one field is provided for update

module.exports = {
  validateRequest,
  restaurantSchema,
  updateRestaurantSchema,
};
