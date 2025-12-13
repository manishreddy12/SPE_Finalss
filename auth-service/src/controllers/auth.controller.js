const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { findUserByEmail, createUser, findUserById } = require('../models/user.model');
const { signToken } = require('../config/jwt');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const start = Date.now();
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const { name, email, password, role } = value;

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser({ name, email, passwordHash, role });

    logger.info({
      msg: 'User registered',
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    logger.error({ msg: 'Register error', err });
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    const duration = (Date.now() - start) / 1000;
    req.metricsDuration && req.metricsDuration(duration);
  }
}

async function login(req, res) {
  const start = Date.now();
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { email, password } = value;
    console.log(email+password);
    const user = await findUserByEmail(email);
    if (!user) {
      // avoid leaking whether email exists
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const token = signToken(payload);

    logger.info({ msg: 'User logged in', userId: user.id, email: user.email });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    logger.error({ msg: 'Login error', err });
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    const duration = (Date.now() - start) / 1000;
    req.metricsDuration && req.metricsDuration(duration);
  }
}

async function me(req, res) {
  const start = Date.now();
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    logger.error({ msg: '/auth/me error', err });
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    const duration = (Date.now() - start) / 1000;
    req.metricsDuration && req.metricsDuration(duration);
  }
}

// exports.login = async (req, res) => {
//   console.log("RAW BODY:", req.body);
//   res.status(200).json({ ok: true });
// };

module.exports = {
  register,
  login,
  me
};
