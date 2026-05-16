const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

const adminOnly = [verifyToken, verifyRole([3])];

// ── Dashboard overview ────────────────────────────────────────────────────────
router.get('/dashboard', ...adminOnly, async (req, res) => {
  try {
    const [userStats, apptStats, recentUsers, topProviders] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE role_id = 1)                       AS total_patients,
          COUNT(*) FILTER (WHERE role_id = 2)                       AS total_providers,
          COUNT(*) FILTER (WHERE account_status = 'Active')         AS active_users,
          COUNT(*) FILTER (WHERE account_status = 'Suspended')      AS suspended_users
        FROM users WHERE role_id IN (1, 2)
      `),
      pool.query(`
        SELECT
          COUNT(*)                                                        AS total_appointments,
          COUNT(*) FILTER (WHERE appointment_datetime::date = CURRENT_DATE) AS today,
          COUNT(*) FILTER (WHERE status = 'Pending')                      AS pending,
          COUNT(*) FILTER (WHERE status = 'Confirmed')                    AS confirmed,
          COUNT(*) FILTER (WHERE status = 'Completed')                    AS completed,
          COUNT(*) FILTER (WHERE status = 'Cancelled')                    AS cancelled
        FROM appointments
      `),
      pool.query(`
        SELECT user_id, first_name, last_name, email, role_id, account_status, created_at
        FROM users WHERE role_id IN (1, 2)
        ORDER BY created_at DESC LIMIT 10
      `),
      pool.query(`
        SELECT u.user_id, u.first_name, u.last_name, p.specialisation,
               COUNT(a.appointment_id) AS total_appointments
        FROM users u
        LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
        LEFT JOIN appointments a ON u.user_id = a.provider_id
        WHERE u.role_id = 2
        GROUP BY u.user_id, u.first_name, u.last_name, p.specialisation
        ORDER BY total_appointments DESC LIMIT 5
      `),
    ]);

    res.json({
      userStats:    userStats.rows[0],
      apptStats:    apptStats.rows[0],
      recentUsers:  recentUsers.rows,
      topProviders: topProviders.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── All users ─────────────────────────────────────────────────────────────────
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_id, first_name, last_name, email, phone, role_id, account_status, created_at
      FROM users WHERE role_id IN (1, 2)
      ORDER BY created_at DESC
    `);
    res.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Update user status ────────────────────────────────────────────────────────
router.put('/users/:id/status', ...adminOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Active', 'Inactive', 'Suspended'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  try {
    await pool.query(
      `UPDATE users SET account_status = $1 WHERE user_id = $2`,
      [status, req.params.id]
    );
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── All appointments ──────────────────────────────────────────────────────────
router.get('/appointments', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.appointment_id, a.appointment_datetime, a.reason, a.status,
             pt.first_name AS patient_first, pt.last_name AS patient_last,
             pr.first_name AS provider_first, pr.last_name AS provider_last,
             pp.specialisation
      FROM appointments a
      JOIN users pt ON a.patient_id  = pt.user_id
      JOIN users pr ON a.provider_id = pr.user_id
      LEFT JOIN provider_profiles pp ON pr.user_id = pp.provider_id
      ORDER BY a.appointment_datetime DESC
    `);
    res.json({ appointments: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Create provider account ───────────────────────────────────────────────────
router.post('/providers', ...adminOnly, async (req, res) => {
  const { first_name, last_name, email, phone, temp_password,
          specialisation, degree, sex, spoken_language, bio } = req.body;

  if (!first_name || !last_name || !email || !temp_password) {
    return res.status(400).json({ message: 'first_name, last_name, email and temp_password are required' });
  }

  try {
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    const hash = await bcrypt.hash(temp_password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role_id, account_status)
       VALUES ($1, $2, $3, $4, $5, 2, 'Active')
       RETURNING user_id, first_name, last_name, email, phone, role_id, account_status, created_at`,
      [first_name, last_name, email, phone || null, hash]
    );
    const newUser = userResult.rows[0];

    if (specialisation || degree || sex || spoken_language || bio) {
      await pool.query(
        `INSERT INTO provider_profiles (provider_id, specialisation, degree, sex, spoken_language, bio)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newUser.user_id, specialisation || null, degree || null,
         sex || null, spoken_language || null, bio || null]
      );
    }

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
