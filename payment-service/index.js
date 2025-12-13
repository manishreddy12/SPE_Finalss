require('dotenv').config();

const app = require('./src/server');
const pool = require('./src/config/database');
const redis = require('./src/config/redis');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3003;
const SERVICE_NAME = process.env.SERVICE_NAME || 'payment-service';

const server = app.listen(PORT, () => {
  logger.info(`${SERVICE_NAME} started`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  server.close(async () => {
    await pool.end();
    await redis.quit();
    logger.info('Server and connections closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');

  server.close(async () => {
    await pool.end();
    await redis.quit();
    logger.info('Server and connections closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});
