const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const idempotencyMiddleware = require('./middleware/idempotency');

const paymentsRoutes = require('./routes/payments');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');

const app = express();

// Security
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
  })
);

// Compression
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests',
  skip: (req) => process.env.NODE_ENV === 'test'
});

const paymentLimiter = rateLimit({
  windowMs: 60000,
  max: parseInt(process.env.RATE_LIMIT_PAYMENT_ENDPOINT) || 20,
  message: 'Too many payment requests'
});

app.use('/api/', limiter);
app.use('/payments', paymentLimiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging & Idempotency
app.use(requestLogger);
app.use('/payments', idempotencyMiddleware);

// Routes
app.use('/payments', paymentsRoutes);
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Payment Service is running',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path
  });

  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
