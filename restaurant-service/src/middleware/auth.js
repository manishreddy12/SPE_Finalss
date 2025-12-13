const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// ============================================
// TOKEN VERIFICATION MIDDLEWARE
// ============================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Missing authorization header', { path: req.path });
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    logger.error('JWT verification failed', {
      error: error.message,
      path: req.path,
    });

    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================
// ADMIN ROLE VERIFICATION MIDDLEWARE
// ============================================
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Admin access denied', {
      userId: req.user?.id,
      path: req.path,
    });

    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };
