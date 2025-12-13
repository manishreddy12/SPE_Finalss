const { Pool } = require('pg');
const logger = require('./logger');

// ============================================
// DATABASE POOL CONFIGURATION
// ============================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'foodorder_db',
  min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
});

// ============================================
// CONNECTION EVENT HANDLERS
// ============================================
pool.on('connect', () => {
  logger.debug('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err });
});

// ============================================
// CONNECTION TEST
// ============================================
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed', { error: err.message });
    logger.info('Continuing without database - routes will fail when attempting DB operations');
  } else {
    logger.info('Database connected successfully', { time: res.rows[0].now });
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', async () => {
  logger.info('Closing database pool');
  await pool.end();
  process.exit(0);
});

module.exports = pool;
