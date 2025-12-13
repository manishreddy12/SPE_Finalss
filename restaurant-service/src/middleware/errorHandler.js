const logger = require('../config/logger');

// ============================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ============================================
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
    userId: req.user?.id,
  });

  res.status(status).json({
    error: message,
    status,
    path: req.path,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
};

module.exports = errorHandler;
