const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const { authenticateJWT, rateLimitLogin } = require('../middleware/auth.middleware');

// Attach Prometheus timing hook per-route
function withMetrics(controller, routeName) {
  return async (req, res, next) => {
    const start = process.hrtime();
    req.metricsDuration = (seconds) => {
      if (req.app.locals.observeRequestDuration) {
        req.app.locals.observeRequestDuration(req.method, routeName, res.statusCode || 200, seconds);
      }
    };
    try {
      await controller(req, res, next);
    } finally {
      const diff = process.hrtime(start);
      const duration = diff[0] + diff[1] / 1e9;
      req.metricsDuration && req.metricsDuration(duration);
    }
  };
}

router.post('/register', withMetrics(register, '/auth/register'));
router.post('/login', rateLimitLogin, withMetrics(login, '/auth/login'));
router.get('/me', authenticateJWT, withMetrics(me, '/auth/me'));

module.exports = router;
