const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// Book an appointment (patients only)
router.post('/book', verifyToken, async (req, res) => {
  const { provider_id, availability_id, reason, notes } = req.body;
  const patient_id = req.user.user_id;

  if (req.user.role_id !== 1) {
    return res.status(403).json({ message: 'Only patients can book appointments' });
  }

  try {
    // Get the availability slot
    const slot = await pool.query(
      `SELECT * FROM availability WHERE availability_id = $1`,
      [availability_id]
    );

    if (slot.rows.length === 0) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }

    if (slot.rows[0].is_booked) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    if (slot.rows[0].provider_id !== provider_id) {
      return res.status(400).json({ message: 'Slot does not belong to this provider' });
    }

    const appointment_datetime = slot.rows[0].slot_start;

    // Create the appointment
    const newAppointment = await pool.query(
      `INSERT INTO appointments 
        (patient_id, provider_id, reason, notes, appointment_datetime)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patient_id, provider_id, reason, notes, appointment_datetime]
    );

    // Mark the slot as booked
    await pool.query(
      `UPDATE availability SET is_booked = true WHERE availability_id = $1`,
      [availability_id]
    );

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: newAppointment.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for the logged in user
router.get('/my', verifyToken, async (req, res) => {
  const { user_id, role_id } = req.user;

  try {
    let appointments;

    if (role_id === 1) {
      // Patient sees their own appointments
      appointments = await pool.query(
        `SELECT a.*, 
          u.first_name AS provider_first_name, 
          u.last_name AS provider_last_name
         FROM appointments a
         JOIN users u ON a.provider_id = u.user_id
         WHERE a.patient_id = $1
         ORDER BY a.appointment_datetime DESC`,
        [user_id]
      );
    } else if (role_id === 2) {
      // Provider sees appointments assigned to them
      appointments = await pool.query(
        `SELECT a.*, 
          u.first_name AS patient_first_name, 
          u.last_name AS patient_last_name
         FROM appointments a
         JOIN users u ON a.patient_id = u.user_id
         WHERE a.provider_id = $1
         ORDER BY a.appointment_datetime DESC`,
        [user_id]
      );
    }

    res.json({ appointments: appointments.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel an appointment (patients only)
router.put('/cancel/:appointment_id', verifyToken, async (req, res) => {
  const { appointment_id } = req.params;
  const patient_id = req.user.user_id;

  if (req.user.role_id !== 1) {
    return res.status(403).json({ message: 'Only patients can cancel appointments' });
  }

  try {
    const appointment = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1`,
      [appointment_id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.rows[0].patient_id !== patient_id) {
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }

    if (appointment.rows[0].status === 'Cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    // Update appointment status
    await pool.query(
      `UPDATE appointments SET status = 'Cancelled' WHERE appointment_id = $1`,
      [appointment_id]
    );

    // Free up the availability slot
    await pool.query(
      `UPDATE availability SET is_booked = false 
       WHERE provider_id = $1 
       AND slot_start = $2`,
      [appointment.rows[0].provider_id, appointment.rows[0].appointment_datetime]
    );

    res.json({ message: 'Appointment cancelled successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status (providers only)
router.put('/status/:appointment_id', verifyToken, async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body;
  const provider_id = req.user.user_id;

  if (req.user.role_id !== 2) {
    return res.status(403).json({ message: 'Only providers can update appointment status' });
  }

  const validStatuses = ['Confirmed', 'Cancelled', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const appointment = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1`,
      [appointment_id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.rows[0].provider_id !== provider_id) {
      return res.status(403).json({ message: 'You can only update your own appointments' });
    }

    await pool.query(
      `UPDATE appointments SET status = $1 WHERE appointment_id = $2`,
      [status, appointment_id]
    );

    res.json({ message: `Appointment marked as ${status}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;