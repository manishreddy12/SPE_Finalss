const winston = require('winston');
const path = require('path');

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV !== 'production';

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.File({
    filename: path.join('logs', 'error.json'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5
  }),
  new winston.transports.File({
    filename: path.join('logs', 'combined.json'),
    maxsize: 5242880,
    maxFiles: 5
  })
];

if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

const logger = winston.createLogger({
  level: logLevel,
  format: jsonFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'payment-service',
    environment: process.env.NODE_ENV
  },
  transports
});

module.exports = logger;
