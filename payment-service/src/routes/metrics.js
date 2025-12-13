const express = require('express');
const router = express.Router();

let paymentCount = 0;
let paymentSuccess = 0;
let paymentFailed = 0;
let fraudDetected = 0;

global.trackPaymentMetric = (type = 'success') => {
  paymentCount++;
  if (type === 'success') paymentSuccess++;
  if (type === 'failed') paymentFailed++;
  if (type === 'fraud') fraudDetected++;
};

router.get('/', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  const metrics = `
# HELP payment_total_requests Total payment requests
# TYPE payment_total_requests counter
payment_total_requests{service="payment-service"} ${paymentCount}

# HELP payment_successful_total Successful payments
# TYPE payment_successful_total counter
payment_successful_total{service="payment-service"} ${paymentSuccess}

# HELP payment_failed_total Failed payments
# TYPE payment_failed_total counter
payment_failed_total{service="payment-service"} ${paymentFailed}

# HELP payment_fraud_detected_total Fraud detections
# TYPE payment_fraud_detected_total counter
payment_fraud_detected_total{service="payment-service"} ${fraudDetected}

# HELP payment_uptime_seconds Service uptime
# TYPE payment_uptime_seconds gauge
payment_uptime_seconds ${uptime}

# HELP payment_memory_heap_used_bytes Heap used
# TYPE payment_memory_heap_used_bytes gauge
payment_memory_heap_used_bytes ${memUsage.heapUsed}
`;

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

module.exports = router;
