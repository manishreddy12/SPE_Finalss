const redis = require('../config/redis');
const logger = require('../config/logger');

const idempotencyMiddleware = async (req, res, next) => {
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res
      .status(400)
      .json({ error: 'Idempotency-Key header required for POST requests' });
  }

  try {
    const cacheKey = `idempotency:${idempotencyKey}`;
    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      logger.info('Idempotent request detected - returning cached response', {
        idempotencyKey,
        requestId: req.id
      });
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Cache the response
      const ttl = parseInt(process.env.IDEMPOTENCY_KEY_TTL) || 86400;
      redis
        .setEx(cacheKey, ttl, JSON.stringify(data))
        .catch((err) =>
          logger.error('Failed to cache idempotent response', {
            error: err.message
          })
        );

      return originalJson(data);
    };

    req.idempotencyKey = idempotencyKey;

    next();
  } catch (error) {
    logger.error('Idempotency check failed', { error: error.message });
    next(error);
  }
};

module.exports = idempotencyMiddleware;
