const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    status,
    message,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?.id,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Don't expose sensitive information
  const responseError = status === 500 ? 'Internal Server Error' : message;

  res.status(status).json({
    error: responseError,
    status,
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
