const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Get all providers (PUBLIC — no auth required)
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
             p.specialisation, p.degree, p.spoken_language, p.bio, p.sex, p.profile_picture,
             COALESCE(p.base_fee, 75.00) AS base_fee,
             COALESCE(AVG(r.rating), 0)::numeric(10,1) AS avg_rating,
             COUNT(r.rating_id) AS rating_count,
             EXISTS (
               SELECT 1 FROM availability a
               WHERE a.provider_id = u.user_id
                 AND a.is_booked = false
                 AND a.slot_start > NOW()
                 AND a.slot_start <= (NOW() + INTERVAL '24 hours')
             ) AS has_available_slots
      FROM users u
      LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
      LEFT JOIN ratings r ON u.user_id = r.provider_id
      WHERE u.role_id = 2 AND u.account_status = 'Active'
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone,
               p.specialisation, p.degree, p.spoken_language, p.bio, p.sex, p.profile_picture, p.base_fee
      ORDER BY u.first_name ASC
    `);
    res.json({ providers: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single provider by ID (protected)
router.get('/:provider_id', verifyToken, async (req, res) => {
  const { provider_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
             u.date_of_birth,
             p.specialisation, p.degree, p.sex, p.spoken_language,
             p.bio, p.profile_picture, COALESCE(p.base_fee, 75.00) AS base_fee
      FROM users u
      LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
      WHERE u.user_id = $1 AND u.role_id = 2
    `, [provider_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json({ provider: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update own provider profile (providers only)
router.post('/profile', verifyToken, verifyRole([2]), async (req, res) => {
  const { specialisation, degree, sex, spoken_language, bio, profile_picture, base_fee } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO provider_profiles (provider_id, specialisation, degree, sex, spoken_language, bio, profile_picture, base_fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (provider_id)
       DO UPDATE SET specialisation = $2, degree = $3, sex = $4, spoken_language = $5, bio = $6,
                     profile_picture = COALESCE($7, provider_profiles.profile_picture),
                     base_fee = COALESCE($8, provider_profiles.base_fee)
       RETURNING *`,
      [req.user.user_id, specialisation, degree, sex, spoken_language, bio, profile_picture ?? null, base_fee ?? null]
    );
    res.status(201).json({ profile: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;