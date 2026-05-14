const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// GET /api/admin/dashboard — headline stats + recent signups
router.get('/dashboard', verifyToken, verifyRole([3]), async (req, res) => {
  try {
    const [userStats, apptStats, recentUsers, providerStats] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                            AS total_users,
          COUNT(CASE WHEN role_id = 1 THEN 1 END)            AS total_patients,
          COUNT(CASE WHEN role_id = 2 THEN 1 END)            AS total_providers,
          COUNT(CASE WHEN account_status = 'Active' THEN 1 END)    AS active_users,
          COUNT(CASE WHEN account_status = 'Inactive' THEN 1 END)  AS inactive_users,
          COUNT(CASE WHEN account_status = 'Suspended' THEN 1 END) AS suspended_users
        FROM users
      `),
      pool.query(`
        SELECT
          COUNT(*)                                                    AS total_appointments,
          COUNT(CASE WHEN status = 'Pending'   THEN 1 END)            AS pending,
          COUNT(CASE WHEN status = 'Confirmed' THEN 1 END)            AS confirmed,
          COUNT(CASE WHEN status = 'Completed' THEN 1 END)            AS completed,
          COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)            AS cancelled,
          COUNT(CASE WHEN appointment_datetime::date = CURRENT_DATE THEN 1 END) AS today
        FROM appointments
      `),
      pool.query(`
        SELECT user_id, first_name, last_name, email, role_id, account_status, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT
          u.user_id, u.first_name, u.last_name,
          pp.specialisation,
          COUNT(a.appointment_id) AS total_appointments
        FROM users u
        LEFT JOIN provider_profiles pp ON u.user_id = pp.provider_id
        LEFT JOIN appointments a       ON u.user_id = a.provider_id
        WHERE u.role_id = 2
        GROUP BY u.user_id, u.first_name, u.last_name, pp.specialisation
        ORDER BY total_appointments DESC
        LIMIT 5
      `),
    ]);

    res.json({
      userStats:     userStats.rows[0],
      apptStats:     apptStats.rows[0],
      recentUsers:   recentUsers.rows,
      topProviders:  providerStats.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users — full user list
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

// PUT /api/admin/users/:id/status — change account_status
router.put('/users/:id/status', verifyToken, verifyRole([3]), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET account_status = $1 WHERE user_id = $2
       RETURNING user_id, first_name, last_name, account_status`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Status updated', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/appointments — all appointments with patient + provider names
router.get('/appointments', verifyToken, verifyRole([3]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.appointment_id, a.status, a.reason, a.appointment_datetime,
        pat.first_name AS patient_first, pat.last_name AS patient_last,
        prov.first_name AS provider_first, prov.last_name AS provider_last,
        pp.specialisation
      FROM appointments a
      JOIN users pat  ON a.patient_id  = pat.user_id
      JOIN users prov ON a.provider_id = prov.user_id
      LEFT JOIN provider_profiles pp ON a.provider_id = pp.provider_id
      ORDER BY a.appointment_datetime DESC
    `);
    res.json({ appointments: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/providers — create a new provider account
router.post('/providers', verifyToken, verifyRole([3]), async (req, res) => {
  const {
    first_name, last_name, email, phone,
    temp_password, specialisation, degree, sex, spoken_language, bio,
  } = req.body;

  if (!first_name || !last_name || !email || !temp_password) {
    return res.status(400).json({ message: 'First name, last name, email and password are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (sex && !['Male', 'Female', 'Other'].includes(sex)) {
    return res.status(400).json({ message: 'Sex must be Male, Female, or Other.' });
  }

  try {
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(temp_password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, role_id, account_status)
       VALUES ($1, $2, $3, $4, $5, 2, 'Active')
       RETURNING user_id, first_name, last_name, email, role_id, account_status, created_at`,
      [first_name, last_name, email, password_hash, phone || null]
    );

    const provider = newUser.rows[0];

    await pool.query(
      `INSERT INTO provider_profiles (provider_id, specialisation, degree, sex, spoken_language, bio)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [provider.user_id, specialisation || null, degree || null, sex || null, spoken_language || null, bio || null]
    );

    res.status(201).json({ message: 'Provider account created successfully.', user: provider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
