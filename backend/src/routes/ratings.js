const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Submit or update a rating (patients only, must have a completed appointment)
router.post('/', verifyToken, verifyRole([1]), async (req, res) => {
  const { provider_id, appointment_id, rating, comment } = req.body;
  const patient_id = req.user.user_id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const appt = await pool.query(
      `SELECT * FROM appointments
       WHERE appointment_id = $1 AND patient_id = $2 AND provider_id = $3 AND status = 'Completed'`,
      [appointment_id, patient_id, provider_id]
    );

    if (appt.rows.length === 0) {
      return res.status(403).json({ message: 'You can only rate a provider after a completed appointment' });
    }

    const result = await pool.query(
      `INSERT INTO ratings (patient_id, provider_id, appointment_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (appointment_id) DO UPDATE SET rating = $4, comment = $5
       RETURNING *`,
      [patient_id, provider_id, appointment_id, rating, comment ?? null]
    );

    res.json({ message: 'Rating submitted', rating: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent public reviews for the home page (no auth required)
router.get('/public', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.rating, r.comment, r.created_at,
              u.first_name, u.last_name,
              pu.first_name AS provider_first_name, pu.last_name AS provider_last_name
       FROM ratings r
       JOIN users u ON r.patient_id = u.user_id
       JOIN users pu ON r.provider_id = pu.user_id
       WHERE r.comment IS NOT NULL AND r.comment != ''
       ORDER BY r.created_at DESC
       LIMIT 6`
    );
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;