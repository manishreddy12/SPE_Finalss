require('dotenv').config();
const app = require('./src/server');
const pool = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3002;
const SERVICE_NAME = process.env.SERVICE_NAME || 'order-service';

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
        logger.info('Server and database connections closed');
        process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(async () => {
        await pool.end();
        logger.info('Server and database connections closed');
        process.exit(0);
    });
});

// Unhandled exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
        error: err.message,
        stack: err.stack
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
        reason,
        promise
    });
    process.exit(1);
});