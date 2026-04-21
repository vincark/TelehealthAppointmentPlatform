const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

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

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
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
      [first_name, last_name, email, password_hash, phone, date_of_birth, address, emergency_contact, health_fund]
    );

    res.status(201).json({
      message: 'Registration successful!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;