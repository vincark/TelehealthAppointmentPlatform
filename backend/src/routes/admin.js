const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', verifyToken, verifyRole([3]), async (req, res) => {
  try {
    const userStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE role_id = 1) AS total_patients,
        COUNT(*) FILTER (WHERE role_id = 2) AS total_providers,
        COUNT(*) FILTER (WHERE account_status = 'Active') AS active_users,
        COUNT(*) FILTER (WHERE account_status = 'Suspended') AS suspended_users
      FROM users
    `);

    const apptStats = await pool.query(`
      SELECT
        COUNT(*) AS total_appointments,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'Confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE DATE(appointment_datetime) = CURRENT_DATE) AS today
      FROM appointments
    `);

    const recentUsers = await pool.query(`
      SELECT user_id, first_name, last_name, email, role_id, account_status, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const topProviders = await pool.query(`
      SELECT u.user_id, u.first_name, u.last_name,
             p.specialisation, COUNT(a.appointment_id) AS total_appointments
      FROM users u
      LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
      LEFT JOIN appointments a ON u.user_id = a.provider_id
      WHERE u.role_id = 2
      GROUP BY u.user_id, u.first_name, u.last_name, p.specialisation
      ORDER BY total_appointments DESC
      LIMIT 5
    `);

    res.json({
      userStats: userStats.rows[0],
      apptStats: apptStats.rows[0],
      recentUsers: recentUsers.rows,
      topProviders: topProviders.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', verifyToken, verifyRole([3]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_id, first_name, last_name, email, phone,
             role_id, account_status, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status
router.put('/users/:user_id/status', verifyToken, verifyRole([3]), async (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Active', 'Inactive', 'Suspended'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET account_status = $1 WHERE user_id = $2 RETURNING user_id, account_status`,
      [status, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User status updated to ${status}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all appointments
router.get('/appointments', verifyToken, verifyRole([3]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.appointment_id, a.status, a.appointment_datetime, a.reason,
        p.first_name AS patient_first, p.last_name AS patient_last,
        d.first_name AS provider_first, d.last_name AS provider_last,
        pr.specialisation
      FROM appointments a
      JOIN users p ON a.patient_id = p.user_id
      JOIN users d ON a.provider_id = d.user_id
      LEFT JOIN provider_profiles pr ON a.provider_id = pr.provider_id
      ORDER BY a.appointment_datetime DESC
    `);
    res.json({ appointments: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create provider account
router.post('/providers', verifyToken, verifyRole([3]), async (req, res) => {
  const {
    first_name, last_name, email, phone,
    temp_password, specialisation, degree, sex, spoken_language, bio
  } = req.body;

  if (!first_name || !last_name || !email || !temp_password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(temp_password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, role_id)
       VALUES ($1, $2, $3, $4, $5, 2)
       RETURNING user_id, first_name, last_name, email, role_id`,
      [first_name, last_name, email, password_hash, phone]
    );

    const provider_id = newUser.rows[0].user_id;

    if (specialisation || degree || sex || spoken_language || bio) {
      await pool.query(
        `INSERT INTO provider_profiles
          (provider_id, specialisation, degree, sex, spoken_language, bio)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [provider_id, specialisation, degree, sex, spoken_language, bio]
      );
    }

    res.status(201).json({
      message: 'Provider account created successfully!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
