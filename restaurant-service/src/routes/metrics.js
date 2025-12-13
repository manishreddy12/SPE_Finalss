const express = require('express');

const router = express.Router();

let requestCount = 0;
let errorCount = 0;

// ============================================
// GLOBAL METRIC TRACKER
// ============================================
global.trackMetrics = (isError = false) => {
  requestCount++;
  if (isError) errorCount++;
};

// ============================================
// PROMETHEUS METRICS ENDPOINT
// ============================================

/**
 * GET /metrics
 * Prometheus-format metrics endpoint
 * Returns metrics for monitoring and observability
 */
router.get('/', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  const metrics = `
# HELP restaurant_requests_total Total HTTP requests
# TYPE restaurant_requests_total counter
restaurant_requests_total{service="restaurant-service"} ${requestCount}

# HELP restaurant_errors_total Total errors
# TYPE restaurant_errors_total counter
restaurant_errors_total{service="restaurant-service"} ${errorCount}

# HELP restaurant_uptime_seconds Service uptime in seconds
# TYPE restaurant_uptime_seconds gauge
restaurant_uptime_seconds ${uptime}

# HELP restaurant_memory_bytes Memory usage stats
# TYPE restaurant_memory_bytes gauge
restaurant_memory_rss_bytes ${memUsage.rss}
restaurant_memory_heap_used_bytes ${memUsage.heapUsed}
restaurant_memory_heap_total_bytes ${memUsage.heapTotal}
`;

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

module.exports = router;
