const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { logger } = require('../utils/logger');

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin user exists and is active
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, username, email, role, is_active FROM admin_users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Temporary user token validation (for order tracking)
const validateUserToken = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required.' });
    }

    // Check if order exists and token is valid
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, token, roll_number, status, created_at FROM orders WHERE token = $1',
      [token]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    req.order = result.rows[0];
    next();
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Generate JWT token for admin
const generateAdminToken = (userId) => {
  return jwt.sign(
    { userId, type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Generate temporary token for user orders
const generateUserToken = () => {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  return token;
};

// Rate limiting for login attempts
const loginAttempts = new Map();

const checkLoginAttempts = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }

  const attempts = loginAttempts.get(ip);
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.' 
    });
  }

  next();
};

// Record login attempt
const recordLoginAttempt = (ip, success) => {
  if (success) {
    loginAttempts.delete(ip);
  } else {
    if (!loginAttempts.has(ip)) {
      loginAttempts.set(ip, []);
    }
    loginAttempts.get(ip).push(Date.now());
  }
};

// Clean up old login attempts periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  for (const [ip, attempts] of loginAttempts.entries()) {
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    if (recentAttempts.length === 0) {
      loginAttempts.delete(ip);
    } else {
      loginAttempts.set(ip, recentAttempts);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = {
  authenticateAdmin,
  validateUserToken,
  generateAdminToken,
  generateUserToken,
  checkLoginAttempts,
  recordLoginAttempt
}; 