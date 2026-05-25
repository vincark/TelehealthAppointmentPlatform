const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { 
  sendConfirmationEmail, 
  sendCancellationEmail,
  sendRescheduledEmail,
  sendStatusUpdateEmail 
} = require('../utils/email');

// Book an appointment (patients only)
router.post('/book', verifyToken, verifyRole([1]), async (req, res) => {
  const { provider_id, availability_id, reason, notes, fee } = req.body;
  const patient_id = req.user.user_id;

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
        (patient_id, provider_id, reason, notes, appointment_datetime, fee)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [patient_id, provider_id, reason, notes, appointment_datetime, fee ?? null]
    );

    // Mark the slot as booked
    await pool.query(
      `UPDATE availability SET is_booked = true WHERE availability_id = $1`,
      [availability_id]
    );

    const _dtIso = appointment_datetime.toISOString();
    const _datePart = _dtIso.split('T')[0];
    const [_yr, _mo, _dy] = _datePart.split('-').map(Number);
    const _timePart = _dtIso.split('T')[1].slice(0, 5);
    const [_hh, _mm] = _timePart.split(':').map(Number);
    const _period = _hh >= 12 ? 'PM' : 'AM';
    const _h12 = _hh % 12 || 12;
    const _months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const _apptLabel = `${_dy} ${_months[_mo - 1]} ${_yr} at ${_h12}:${String(_mm).padStart(2, '0')} ${_period}`;

    await createNotification(
        patient_id,
        newAppointment.rows[0].appointment_id,
        `Your appointment has been booked for ${_apptLabel}`,
        'Confirmation'
    );
    await createNotification(
        provider_id,
        newAppointment.rows[0].appointment_id,
        `You have a new appointment request from a patient`,
        'Confirmation'
    );
    // Get patient and provider details for email
    const patientResult = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE user_id = $1',
      [patient_id]
    );
    const providerResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE user_id = $1',
      [provider_id]
    );

    const patient = patientResult.rows[0];
    const provider = providerResult.rows[0];

    try {
      await sendConfirmationEmail(
        patient.email,
        `${patient.first_name} ${patient.last_name}`,
        `Dr ${provider.first_name} ${provider.last_name}`,
        appointment_datetime
      );
    } catch (emailErr) {
      console.warn('Confirmation email failed (non-fatal):', emailErr.message);
    }
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
router.put('/cancel/:appointment_id', verifyToken, verifyRole([1]), async (req, res) => {
  const { appointment_id } = req.params;
  const patient_id = req.user.user_id;

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

    await createNotification(
        patient_id,
        parseInt(appointment_id),
        'Your appointment has been cancelled',
        'Cancellation'
    );
    const patientResult = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE user_id = $1',
      [patient_id]
    );
    const patient = patientResult.rows[0];

    try {
      await sendCancellationEmail(
        patient.email,
        `${patient.first_name} ${patient.last_name}`,
        appointment.rows[0].appointment_datetime
      );
    } catch (emailErr) {
      console.warn('Cancellation email failed (non-fatal):', emailErr.message);
    }
    res.json({ message: 'Appointment cancelled successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status (providers only)
router.put('/status/:appointment_id', verifyToken, verifyRole([2]), async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body;
  const provider_id = req.user.user_id;

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

    await createNotification(
        appointment.rows[0].patient_id,
        parseInt(appointment_id),
        `Your appointment has been ${status}`,
        status === 'Confirmed' ? 'Confirmation' : 'Cancellation'
    );
    const patientResult = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE user_id = $1',
      [appointment.rows[0].patient_id]
    );
    const providerResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE user_id = $1',
      [provider_id]
    );

    const patient = patientResult.rows[0];
    const provider = providerResult.rows[0];

    try {
      await sendStatusUpdateEmail(
        patient.email,
        `${patient.first_name} ${patient.last_name}`,
        `Dr ${provider.first_name} ${provider.last_name}`,
        appointment.rows[0].appointment_datetime,
        status
      );
    } catch (emailErr) {
      console.warn('Status update email failed (non-fatal):', emailErr.message);
    }
    res.json({ message: `Appointment marked as ${status}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reschedule an appointment (patients only)
router.put('/reschedule/:appointment_id', verifyToken, verifyRole([1]), async (req, res) => {
  const { availability_id } = req.body;
  const { appointment_id } = req.params;

  try {
    // Check the appointment exists and belongs to this patient
    const appointment = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2`,
      [appointment_id, req.user.user_id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or not yours' });
    }

    if (appointment.rows[0].status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule a cancelled appointment' });
    }

    // Check the new slot exists and is available
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

    // Free up the old slot
    await pool.query(
      `UPDATE availability SET is_booked = false 
       WHERE provider_id = $1 AND slot_start = $2`,
      [appointment.rows[0].provider_id, appointment.rows[0].appointment_datetime]
    );

    // Book the new slot
    await pool.query(
      `UPDATE availability SET is_booked = true WHERE availability_id = $1`,
      [availability_id]
    );

    // Update the appointment
    const result = await pool.query(
      `UPDATE appointments 
       SET appointment_datetime = $1, status = 'Pending'
       WHERE appointment_id = $2
       RETURNING *`,
      [slot.rows[0].slot_start, appointment_id]
    );

    const _rIso = slot.rows[0].slot_start.toISOString();
    const [_rYr, _rMo, _rDy] = _rIso.split('T')[0].split('-').map(Number);
    const [_rHh, _rMm] = _rIso.split('T')[1].slice(0, 5).split(':').map(Number);
    const _rPeriod = _rHh >= 12 ? 'PM' : 'AM';
    const _rH12 = _rHh % 12 || 12;
    const _rMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const _rLabel = `${_rDy} ${_rMonths[_rMo - 1]} ${_rYr} at ${_rH12}:${String(_rMm).padStart(2, '0')} ${_rPeriod}`;

    await createNotification(
      req.user.user_id,
      parseInt(appointment_id),
      `Your appointment has been rescheduled to ${_rLabel}`,
      'Rescheduled'
    );

    const patientResult = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE user_id = $1',
      [req.user.user_id]
    );
    const providerResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE user_id = $1',
      [appointment.rows[0].provider_id]
    );

    const patient = patientResult.rows[0];
    const provider = providerResult.rows[0];

    try {
      await sendRescheduledEmail(
        patient.email,
        `${patient.first_name} ${patient.last_name}`,
        `Dr ${provider.first_name} ${provider.last_name}`,
        slot.rows[0].slot_start
      );
    } catch (emailErr) {
      console.warn('Reschedule email failed (non-fatal):', emailErr.message);
    }
    res.json({
      message: 'Appointment rescheduled successfully!', 
      appointment: result.rows[0] 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save consultation notes + prescription and mark as Completed (providers only)
router.put('/consult/:appointment_id', verifyToken, verifyRole([2]), async (req, res) => {
  const { appointment_id } = req.params;
  const { notes, prescription } = req.body;
  const provider_id = req.user.user_id;

  if (!notes) {
    return res.status(400).json({ message: 'Consultation notes are required' });
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
      return res.status(403).json({ message: 'You can only add notes to your own appointments' });
    }

    const updated = await pool.query(
      `UPDATE appointments
       SET notes = $1, prescription = $2, status = 'Completed'
       WHERE appointment_id = $3
       RETURNING *`,
      [notes || null, prescription || null, appointment_id]
    );

    await createNotification(
      appointment.rows[0].patient_id,
      parseInt(appointment_id),
      'Your consultation notes and prescription are now available in your Medical History',
      'Confirmation'
    );

    res.json({ message: 'Consultation notes saved', appointment: updated.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation notes for a specific appointment
router.get('/:appointment_id/notes', verifyToken, async (req, res) => {
  const { appointment_id } = req.params;
  const { user_id } = req.user;

  try {
    const result = await pool.query(
      `SELECT a.appointment_id, a.notes, a.prescription, a.status,
              a.appointment_datetime, a.reason,
              u.first_name AS provider_first_name, u.last_name AS provider_last_name
       FROM appointments a
       JOIN users u ON a.provider_id = u.user_id
       WHERE a.appointment_id = $1
         AND (a.patient_id = $2 OR a.provider_id = $2)`,
      [appointment_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ appointment: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;