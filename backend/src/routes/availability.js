const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Add availability slot (providers only)
router.post('/add', verifyToken, verifyRole([2]), async (req, res) => {
  const { slot_start, slot_end } = req.body;
  const provider_id = req.user.user_id;

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
router.delete('/delete/:availability_id', verifyToken, verifyRole([2]), async (req, res) => {
  const { availability_id } = req.params;
  const provider_id = req.user.user_id;

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

// Clear all future unbooked slots for this provider (used when resetting schedule)
router.delete('/clear-future', verifyToken, verifyRole([2]), async (req, res) => {
  const provider_id = req.user.user_id;

  try {
    await pool.query(
      `DELETE FROM availability 
       WHERE provider_id = $1 
       AND is_booked = false 
       AND slot_start > NOW()`,
      [provider_id]
    );

    res.json({ message: 'Future unbooked slots cleared successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add multiple availability slots at once (bulk insert)
router.post('/add-bulk', verifyToken, verifyRole([2]), async (req, res) => {
  const { slots } = req.body;
  const provider_id = req.user.user_id;

  if (!slots || slots.length === 0) {
    return res.status(400).json({ message: 'No slots provided' });
  }

  try {
    let saved = 0;
    let overlapped = 0;

    for (const slot of slots) {
      const overlapping = await pool.query(
        `SELECT * FROM availability 
         WHERE provider_id = $1 
         AND (slot_start, slot_end) OVERLAPS ($2::timestamp, $3::timestamp)`,
        [provider_id, slot.slot_start, slot.slot_end]
      );

      if (overlapping.rows.length > 0) {
        overlapped++;
        continue;
      }

      await pool.query(
        `INSERT INTO availability (provider_id, slot_start, slot_end)
         VALUES ($1, $2, $3)`,
        [provider_id, slot.slot_start, slot.slot_end]
      );
      saved++;
    }

    res.status(201).json({ message: `${saved} slots saved, ${overlapped} overlaps skipped`, saved, overlapped });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;