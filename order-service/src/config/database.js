const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'foodorder_db',
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
    logger.debug('Database connection established');
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', { error: err.message });
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        logger.error('Database connection test failed', { error: err.message });
    } else {
        logger.info('Database connection verified', { time: res.rows[0].now });
    }
});

process.on('SIGINT', async () => {
    logger.info('Closing database pool');
    await pool.end();
    process.exit(0);
});

module.exports = pool;