const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { logger } = require('../utils/logger');

// POST /api/faculty-login
router.post('/faculty-login', async (req, res) => {
  const { department_name, password } = req.body;

  if (!department_name || !password) {
    return res.status(400).json({ success: false, message: 'Department name and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM Faculty WHERE department_name = $1 AND password = $2',
      [department_name, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid department name or password' });
    }

    res.status(200).json({ success: true, message: 'Login successful', faculty: result.rows[0] });
  } catch (err) {
    console.error('Faculty login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
