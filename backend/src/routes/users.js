const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Get own profile
router.get('/me', verifyToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, phone, 
              date_of_birth, address, emergency_contact, 
              health_fund, role_id, account_status, created_at
       FROM users WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update own profile
router.put('/me', verifyToken, async (req, res) => {
  const { user_id } = req.user;
  const { first_name, last_name, phone, address, emergency_contact, health_fund, date_of_birth } = req.body;

  try {
    const updated = await pool.query(
      `UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          address = COALESCE($4, address),
          emergency_contact = COALESCE($5, emergency_contact),
          health_fund = COALESCE($6, health_fund),
          date_of_birth = COALESCE($7, date_of_birth)
      WHERE user_id = $8
      RETURNING user_id, first_name, last_name, email, 
                phone, address, emergency_contact, health_fund, date_of_birth`,
      [first_name, last_name, phone, address, emergency_contact, health_fund, date_of_birth, user_id]
    );

    res.json({
      message: 'Profile updated successfully!',
      user: updated.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a provider's public profile
router.get('/provider/:provider_id', verifyToken, async (req, res) => {
  const { provider_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, 
              p.degree, p.sex, p.specialisation, 
              p.spoken_language, p.bio, p.profile_picture
       FROM users u
       JOIN provider_profiles p ON u.user_id = p.provider_id
       WHERE u.user_id = $1`,
      [provider_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    res.json({ provider: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;