const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for a booked appointment (patients only)
router.post('/create-payment-intent', verifyToken, verifyRole([1]), async (req, res) => {
  const { appointment_id } = req.body;

  try {
    const appointment = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2`,
      [appointment_id, req.user.user_id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.rows[0].payment_status === 'Paid') {
      return res.status(400).json({ message: 'This appointment has already been paid for' });
    }

    // Fee was locked at booking time — use exactly what the patient agreed to pay
    const amount = appointment.rows[0].fee;

    if (!amount) {
      return res.status(400).json({ message: 'No fee recorded for this appointment' });
    }

    // Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'aud',
      metadata: {
        appointment_id: appointment_id.toString(),
        patient_id: req.user.user_id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment was successful and update the appointment (patients only)
router.post('/confirm-payment', verifyToken, verifyRole([1]), async (req, res) => {
  const { appointment_id, payment_intent_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not been completed' });
    }

    await pool.query(
      `UPDATE appointments
       SET payment_status = 'Paid', payment_intent_id = $1
       WHERE appointment_id = $2 AND patient_id = $3`,
      [payment_intent_id, appointment_id, req.user.user_id]
    );

    res.json({ message: 'Payment confirmed! Your appointment is booked.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
