const logger = require('../config/logger');

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('HTTP Request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    });
  });

  next();
};

module.exports = requestLogger;
