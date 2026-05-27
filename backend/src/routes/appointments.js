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
  const { provider_id, availability_id, reason, notes } = req.body;
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

    // Calculate fee based on time of day and day of week
    const baseFeeResult = await pool.query(
      `SELECT COALESCE(base_fee, 75) AS base_fee FROM provider_profiles WHERE provider_id = $1`,
      [provider_id]
    );
    const baseFee = parseFloat(baseFeeResult.rows[0]?.base_fee ?? 75);
    const slotDate = new Date(appointment_datetime);
    const day = slotDate.getDay(); // 0=Sun, 6=Sat
    const hour = slotDate.getHours();
    const isAfterHours = day === 0 || day === 6 || hour < 8 || hour >= 18;
    const fee = isAfterHours ? Math.round(baseFee * 1.2) : baseFee;

    // Create the appointment
    const newAppointment = await pool.query(
      `INSERT INTO appointments 
        (patient_id, provider_id, reason, notes, appointment_datetime, fee)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [patient_id, provider_id, reason, notes, appointment_datetime, fee]
    );

    // Mark the slot as booked
    await pool.query(
      `UPDATE availability SET is_booked = true WHERE availability_id = $1`,
      [availability_id]
    );

    await createNotification(
        patient_id,
        newAppointment.rows[0].appointment_id,
        `Your appointment has been booked for ${appointment_datetime}`,
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

    await sendConfirmationEmail(
      patient.email,
      `${patient.first_name} ${patient.last_name}`,
      `Dr ${provider.first_name} ${provider.last_name}`,
      appointment_datetime
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
          u.last_name AS provider_last_name,
          COALESCE(a.fee, pp.base_fee, 75) AS consultation_fee,
          av_req.slot_start AS requested_slot_start
        FROM appointments a
        JOIN users u ON a.provider_id = u.user_id
        LEFT JOIN provider_profiles pp ON a.provider_id = pp.provider_id
        LEFT JOIN availability av_req ON a.requested_availability_id = av_req.availability_id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_datetime DESC`,
        [user_id]
      );
    } else if (role_id === 2) {
      // Provider sees appointments assigned to them
      appointments = await pool.query(
        `SELECT a.*,
          u.first_name AS patient_first_name,
          u.last_name AS patient_last_name,
          av_req.slot_start AS requested_slot_start
         FROM appointments a
         JOIN users u ON a.patient_id = u.user_id
         LEFT JOIN availability av_req ON a.requested_availability_id = av_req.availability_id
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

    await sendCancellationEmail(
      patient.email,
      `${patient.first_name} ${patient.last_name}`,
      appointment.rows[0].appointment_datetime
    );
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

    await sendStatusUpdateEmail(
      patient.email,
      `${patient.first_name} ${patient.last_name}`,
      `Dr ${provider.first_name} ${provider.last_name}`,
      appointment.rows[0].appointment_datetime,
      status
    );
    res.json({ message: `Appointment marked as ${status}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reschedule request — patient submits a new slot for doctor approval
router.put('/reschedule/:appointment_id', verifyToken, verifyRole([1]), async (req, res) => {
  const { availability_id } = req.body;
  const { appointment_id } = req.params;
  const patient_id = req.user.user_id;

  try {
    const appointment = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2`,
      [appointment_id, patient_id]
    );
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or not yours' });
    }
    const appt = appointment.rows[0];
    if (appt.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule a cancelled appointment' });
    }
    if (appt.status === 'reschedule_requested') {
      return res.status(400).json({ message: 'A reschedule request is already pending' });
    }

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

    // Hold the requested slot so no one else books it
    await pool.query(
      `UPDATE availability SET is_booked = true WHERE availability_id = $1`,
      [availability_id]
    );

    // Mark appointment as pending reschedule approval
    await pool.query(
      `UPDATE appointments
       SET status = 'reschedule_requested', requested_availability_id = $1
       WHERE appointment_id = $2`,
      [availability_id, appointment_id]
    );

    // Notify the doctor
    await createNotification(
      appt.provider_id,
      parseInt(appointment_id),
      'A patient has requested to reschedule their appointment — please review.',
      'Rescheduled'
    );

    res.json({ message: 'Reschedule request submitted. Awaiting doctor approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor approves a reschedule request
router.put('/reschedule/:appointment_id/approve', verifyToken, verifyRole([2]), async (req, res) => {
  const { appointment_id } = req.params;
  const provider_id = req.user.user_id;

  try {
    const apptRes = await pool.query(
      `SELECT a.*, av_req.slot_start AS new_slot_start
       FROM appointments a
       LEFT JOIN availability av_req ON a.requested_availability_id = av_req.availability_id
       WHERE a.appointment_id = $1 AND a.provider_id = $2`,
      [appointment_id, provider_id]
    );
    if (apptRes.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRes.rows[0];
    if (appt.status !== 'reschedule_requested') {
      return res.status(400).json({ message: 'No pending reschedule request for this appointment' });
    }

    // Free the original slot
    await pool.query(
      `UPDATE availability SET is_booked = false
       WHERE provider_id = $1 AND slot_start = $2`,
      [provider_id, appt.appointment_datetime]
    );

    // Confirm the appointment at the new time
    await pool.query(
      `UPDATE appointments
       SET appointment_datetime = $1, status = 'Confirmed', requested_availability_id = NULL
       WHERE appointment_id = $2`,
      [appt.new_slot_start, appointment_id]
    );

    await createNotification(
      appt.patient_id,
      parseInt(appointment_id),
      `Your reschedule request has been approved. New time: ${appt.new_slot_start}`,
      'Confirmation'
    );

    const patientResult = await pool.query(
      'SELECT first_name, last_name, email FROM users WHERE user_id = $1',
      [appt.patient_id]
    );
    const providerResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE user_id = $1',
      [provider_id]
    );
    const patient = patientResult.rows[0];
    const provider = providerResult.rows[0];

    await sendRescheduledEmail(
      patient.email,
      `${patient.first_name} ${patient.last_name}`,
      `Dr ${provider.first_name} ${provider.last_name}`,
      appt.new_slot_start
    );

    res.json({ message: 'Reschedule approved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor declines a reschedule request
router.put('/reschedule/:appointment_id/decline', verifyToken, verifyRole([2]), async (req, res) => {
  const { appointment_id } = req.params;
  const provider_id = req.user.user_id;

  try {
    const apptRes = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND provider_id = $2`,
      [appointment_id, provider_id]
    );
    if (apptRes.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = apptRes.rows[0];
    if (appt.status !== 'reschedule_requested') {
      return res.status(400).json({ message: 'No pending reschedule request for this appointment' });
    }

    // Release the held (requested) slot
    if (appt.requested_availability_id) {
      await pool.query(
        `UPDATE availability SET is_booked = false WHERE availability_id = $1`,
        [appt.requested_availability_id]
      );
    }

    // Revert appointment to Confirmed, clear the request
    await pool.query(
      `UPDATE appointments
       SET status = 'Confirmed', requested_availability_id = NULL
       WHERE appointment_id = $1`,
      [appointment_id]
    );

    await createNotification(
      appt.patient_id,
      parseInt(appointment_id),
      'Your reschedule request was declined. Your original appointment remains confirmed.',
      'Cancellation'
    );

    res.json({ message: 'Reschedule declined' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add consultation notes (providers only)
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

    await pool.query(
      `UPDATE appointments 
       SET notes = $1, status = 'Completed'
       WHERE appointment_id = $2`,
      [notes, appointment_id]
    );

    res.json({ message: 'Consultation notes saved successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;