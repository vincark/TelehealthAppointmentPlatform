const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Connect to Stripe using your secret key from .env
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent (patients only)
router.post('/create-payment-intent', verifyToken, verifyRole([1]), async (req, res) => {
  const { appointment_id } = req.body;

  try {
    // Make sure the appointment exists and belongs to this patient
    const appointment = await pool.query(
      `SELECT a.*, pp.consultation_fee 
       FROM appointments a
       JOIN provider_profiles pp ON a.provider_id = pp.provider_id
       WHERE a.appointment_id = $1 AND a.patient_id = $2`,
      [appointment_id, req.user.user_id]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.rows[0].payment_status === 'Paid') {
      return res.status(400).json({ message: 'This appointment has already been paid for' });
    }

    if (appointment.rows[0].status !== 'Confirmed') {
      return res.status(400).json({ message: 'You can only pay for confirmed appointments' });
    }

    // Fee comes from the database automatically — no user input needed!
    const amount = appointment.rows[0].consultation_fee;

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
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

// Confirm payment was successful and update the appointment
router.post('/confirm-payment', verifyToken, verifyRole([1]), async (req, res) => {
  const { appointment_id, payment_intent_id } = req.body;

  try {
    // Double-check with Stripe that the payment actually went through
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not been completed' });
    }

    // Update the appointment in your database
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