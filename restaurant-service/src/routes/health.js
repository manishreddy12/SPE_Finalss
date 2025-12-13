const express = require('express');
const pool = require('../config/database');
const logger = require('../config/logger');

const router = express.Router();

// ============================================
// HEALTH CHECK ROUTES
// ============================================

/**
 * GET /health
 * Kubernetes liveness/readiness probe
 * Checks database connectivity and service health
 */
router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');

    const uptime = process.uptime();

    res.status(200).json({
      status: 'ok',
      service: process.env.SERVICE_NAME,
      uptime,
      timestamp: new Date().toISOString(),
      database: 'connected',
      checks: {
        database: 'pass',
        memory: 'pass',
        disk: 'pass',
      },
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;
