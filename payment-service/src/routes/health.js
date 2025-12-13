const express = require('express');
const router = express.Router();

const pool = require('../config/database');
const redis = require('../config/redis');
const logger = require('../config/logger');

router.get('/', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    const redisAlive = await redis.ping();
    const uptime = process.uptime();

    res.status(200).json({
      status: 'ok',
      service: process.env.SERVICE_NAME,
      uptime,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbResult ? 'pass' : 'fail',
        redis: redisAlive === 'PONG' ? 'pass' : 'fail',
        memory: 'pass'
      }
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
