const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  req.id = uuidv4();
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
      userId: req.user?.id
    });
  });

  next();
};

module.exports = requestLogger;
