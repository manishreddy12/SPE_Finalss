const { verifyToken } = require('../config/jwt');
const logger = require('../utils/logger');

// simple in-memory rate limiter per IP for /auth/login changed
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const LOGIN_MAX_ATTEMPTS = 20;

function rateLimitLogin(req, res, next) {
  const key = req.ip;
  const now = Date.now();

  if (!loginAttempts.has(key)) {
    loginAttempts.set(key, []);
  }

  const attempts = loginAttempts.get(key).filter((ts) => now - ts < LOGIN_WINDOW_MS);
  attempts.push(now);
  loginAttempts.set(key, attempts);

  if (attempts.length > LOGIN_MAX_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
  }

  return next();
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch (err) {
    logger.warn({ msg: 'Invalid JWT', errType: err.name });
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function authorizeRole(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = {
  rateLimitLogin,
  authenticateJWT,
  authorizeRole
};
