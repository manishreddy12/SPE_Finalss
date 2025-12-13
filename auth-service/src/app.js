const express = require('express');
const morgan = require('morgan');
const cors = require('cors');   // <-- ADD THIS
const { v4: uuidv4 } = require('uuid');
const authRoutes = require('./routes/auth.routes');
const { metricsHandler, observeRequestDuration } = require('./metrics');
const logger = require('./utils/logger');

const app = express();

// Attach metrics function globally
app.locals.observeRequestDuration = observeRequestDuration;

/* ---------------------------------------
   ✅ CORS MUST BE ENABLED BEFORE ANYTHING
----------------------------------------*/
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-correlation-id"],
  })
);

// Handle preflight requests
app.options("*", cors());


/* ---------------------------------------
   Body parser
----------------------------------------*/
app.use(express.json());

/* ---------------------------------------
   Correlation ID Middleware
----------------------------------------*/
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  logger.info({
    msg: 'Incoming request',
    method: req.method,
    path: req.path,
    correlationId
  });
  next();
});

/* ---------------------------------------
   Morgan Logging
----------------------------------------*/
app.use(
  morgan((tokens, req, res) => {
    return JSON.stringify({
      msg: 'HTTP access log',
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: Number(tokens['response-time'](req, res)),
      correlationId: req.correlationId
    });
  })
);

/* ---------------------------------------
   Routes
----------------------------------------*/
app.use('/auth', authRoutes);

/* ---------------------------------------
   Health
----------------------------------------*/
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* ---------------------------------------
   Metrics
----------------------------------------*/
app.get('/metrics', metricsHandler);

app.get('/', (req, res) => {
  res.json({
    message: 'Auth Service is running',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/* ---------------------------------------
   404 Handler
----------------------------------------*/
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

/* ---------------------------------------
   Global Error Handler
----------------------------------------*/
app.use((err, req, res, next) => {
  logger.error({ msg: 'Unhandled error', err, correlationId: req.correlationId });
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;



// const express = require('express');
// const morgan = require('morgan');
// const { v4: uuidv4 } = require('uuid');
// const authRoutes = require('./routes/auth.routes');
// const { metricsHandler, observeRequestDuration } = require('./metrics');
// const logger = require('./utils/logger');

// const app = express();

// // Attach metrics function globally
// app.locals.observeRequestDuration = observeRequestDuration;

// // Body parser
// app.use(express.json());

// // Correlation ID + basic logging middleware
// app.use((req, res, next) => {
//   const correlationId = req.headers['x-correlation-id'] || uuidv4();
//   req.correlationId = correlationId;
//   res.setHeader('x-correlation-id', correlationId);
//   logger.info({
//     msg: 'Incoming request',
//     method: req.method,
//     path: req.path,
//     correlationId
//   });
//   next();
// });

// // morgan HTTP logging - JSON with correlationId
// app.use(
//   morgan((tokens, req, res) => {
//     return JSON.stringify({
//       msg: 'HTTP access log',
//       method: tokens.method(req, res),
//       url: tokens.url(req, res),
//       status: Number(tokens.status(req, res)),
//       contentLength: tokens.res(req, res, 'content-length'),
//       responseTime: Number(tokens['response-time'](req, res)),
//       correlationId: req.correlationId
//     });
//   })
// );

// // Routes
// app.use('/auth', authRoutes);

// // Health
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// // Metrics
// app.get('/metrics', metricsHandler);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: 'Not found' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   logger.error({ msg: 'Unhandled error', err, correlationId: req.correlationId });
//   res.status(500).json({ message: 'Internal server error' });
// });

// module.exports = app;
