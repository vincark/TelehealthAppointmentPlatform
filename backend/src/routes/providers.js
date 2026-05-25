const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Get all providers
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
             p.specialisation, p.degree, p.sex, p.spoken_language, 
             p.bio, p.profile_picture
      FROM users u
      LEFT JOIN provider_profiles p ON u.user_id = p.provider_id
      WHERE u.role_id = 2 AND u.account_status = 'Active'
      ORDER BY u.first_name ASC
    `);

    res.json({ providers: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single provider by ID
router.get('/:provider_id', verifyToken, async (req, res) => {
  const { provider_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone,
             u.date_of_birth,
             p.specialisation, p.degree, p.sex, p.spoken_language,
             p.bio, p.profile_picture
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
  const { specialisation, degree, sex, spoken_language, bio } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO provider_profiles (provider_id, specialisation, degree, sex, spoken_language, bio)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (provider_id)
       DO UPDATE SET specialisation = $2, degree = $3, sex = $4, spoken_language = $5, bio = $6
       RETURNING *`,
      [req.user.user_id, specialisation, degree, sex, spoken_language, bio]
    );
    res.status(201).json({ profile: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;