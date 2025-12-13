const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB) || 0,
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    family: 4   // 🔥 FORCE IPv4 (IMPORTANT)
  }
});

client.on('connect', () => {
  logger.info('Redis connected');
});

client.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

client.connect().catch((err) => {
  logger.error('Redis connection failed', { error: err.message });
});

module.exports = client;




