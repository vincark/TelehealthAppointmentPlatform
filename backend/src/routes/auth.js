const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/email');

// Register a new patient
router.post('/register', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    date_of_birth,
    address,
    emergency_contact,
    health_fund
  } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters and include uppercase, lowercase, at least a number, and at least a special character (!@#$%^&*)' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Scramble the password before saving
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Save the new user to the database
    const newUser = await pool.query(
      `INSERT INTO users 
        (first_name, last_name, email, password_hash, phone, date_of_birth, address, emergency_contact, health_fund, role_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
      RETURNING user_id, first_name, last_name, email, role_id`,
      [first_name || '', last_name || '', email, password_hash, phone, date_of_birth, address, emergency_contact, health_fund]
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(email, first_name);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    // Create a token straight away so user is logged in immediately after registration
    const token = jwt.sign(
      { user_id: newUser.rows[0].user_id, role_id: newUser.rows[0].role_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, email, password_hash, role_id, account_status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if account is active
    if (user.account_status !== 'Active') {
      return res.status(403).json({ message: 'Account is inactive or suspended' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a token
    const token = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;