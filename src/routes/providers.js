const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Get all providers (public — no auth required)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
              p.specialisation, p.degree, p.spoken_language, p.bio, p.sex, p.profile_picture,
              COALESCE(AVG(r.rating), 0)::numeric(10,1) AS avg_rating,
              COUNT(r.rating_id) AS rating_count
       FROM users u
       LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
       LEFT JOIN ratings r ON u.user_id = r.provider_id
       WHERE u.role_id = 2
       GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone,
                p.specialisation, p.degree, p.spoken_language, p.bio, p.sex, p.profile_picture`
    );
    res.json({ providers: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single provider by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
              p.specialisation, p.degree, p.spoken_language, p.bio, p.sex, p.profile_picture
       FROM users u
       LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
       WHERE u.user_id = $1 AND u.role_id = 2`,
      [req.params.id]
    );
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
  const { specialisation, degree, sex, spoken_language, bio, profile_picture } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO provider_profiles (provider_id, specialisation, degree, sex, spoken_language, bio, profile_picture)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (provider_id)
       DO UPDATE SET specialisation = $2, degree = $3, sex = $4, spoken_language = $5, bio = $6,
                     profile_picture = COALESCE($7, provider_profiles.profile_picture)
       RETURNING *`,
      [req.user.user_id, specialisation, degree, sex, spoken_language, bio, profile_picture ?? null]
    );
    res.status(201).json({ profile: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;