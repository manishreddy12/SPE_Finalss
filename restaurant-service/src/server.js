// Core dependencies
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Custom modules
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const restaurantRoutes = require('./routes/restaurants');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ============================================
// COMPRESSION & RATE LIMITING
// ============================================
app.use(compression());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  message: 'Too many requests from this IP',
  skip: () => process.env.NODE_ENV === 'test',
});

app.use('/api/', limiter);

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// REQUEST LOGGING
// ============================================
app.use(requestLogger);

// ============================================
// ROUTES
// ============================================
app.use('/restaurants', restaurantRoutes);
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Restaurant Service is running',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

module.exports = app;
