const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// Add availability slot (providers only)
router.post('/add', verifyToken, async (req, res) => {
  const { slot_start, slot_end } = req.body;
  const provider_id = req.user.user_id;

  if (req.user.role_id !== 2) {
    return res.status(403).json({ message: 'Only providers can add availability' });
  }

  try {
    const overlapping = await pool.query(
      `SELECT * FROM availability 
       WHERE provider_id = $1 
       AND (slot_start, slot_end) OVERLAPS ($2::timestamp, $3::timestamp)`,
      [provider_id, slot_start, slot_end]
    );

    if (overlapping.rows.length > 0) {
      return res.status(400).json({ message: 'This slot overlaps with an existing one' });
    }

    const newSlot = await pool.query(
      `INSERT INTO availability (provider_id, slot_start, slot_end)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [provider_id, slot_start, slot_end]
    );

    res.status(201).json({
      message: 'Availability slot added!',
      slot: newSlot.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available slots for a provider
router.get('/provider/:provider_id', verifyToken, async (req, res) => {
  const { provider_id } = req.params;

  try {
    const slots = await pool.query(
      `SELECT * FROM availability 
       WHERE provider_id = $1 
       AND is_booked = false
       AND slot_start > NOW()
       ORDER BY slot_start ASC`,
      [provider_id]
    );

    res.json({ slots: slots.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an availability slot (providers only)
router.delete('/delete/:availability_id', verifyToken, async (req, res) => {
  const { availability_id } = req.params;
  const provider_id = req.user.user_id;

  if (req.user.role_id !== 2) {
    return res.status(403).json({ message: 'Only providers can delete availability' });
  }

  try {
    const slot = await pool.query(
      `SELECT * FROM availability WHERE availability_id = $1`,
      [availability_id]
    );

    if (slot.rows.length === 0) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.rows[0].provider_id !== provider_id) {
      return res.status(403).json({ message: 'You can only delete your own slots' });
    }

    if (slot.rows[0].is_booked) {
      return res.status(400).json({ message: 'Cannot delete a slot that is already booked' });
    }

    await pool.query(
      `DELETE FROM availability WHERE availability_id = $1`,
      [availability_id]
    );

    res.json({ message: 'Slot deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;