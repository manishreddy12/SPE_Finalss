const winston = require('winston');
const path = require('path');

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================
// LOG FORMAT CONFIGURATION
// ============================================
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// ============================================
// TRANSPORT CONFIGURATION
// ============================================
const transports = [
  // Error log file
  new winston.transports.File({
    filename: path.join('logs', 'error.json'),
    level: 'error',
    maxsize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 5,
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join('logs', 'combined.json'),
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  }),
];

// Console logs for development
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// ============================================
// LOGGER INSTANCE
// ============================================
const logger = winston.createLogger({
  level: logLevel,
  format: jsonFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'restaurant-service',
    environment: process.env.NODE_ENV,
  },
  transports,
});

module.exports = logger;
