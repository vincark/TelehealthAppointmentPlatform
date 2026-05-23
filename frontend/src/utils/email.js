const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the email sender
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email service is ready!');
  }
});

// Send appointment confirmation email
const sendConfirmationEmail = async (toEmail, patientName, providerName, appointmentDatetime) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Appointment Confirmation — Telehealth Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c7a7b;">Your Appointment is Confirmed! ✅</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been successfully booked. Here are your details:</p>
        <div style="background: #f0f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Provider:</strong> ${providerName}</p>
          <p><strong>Date & Time:</strong> ${new Date(appointmentDatetime).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <p><strong>Status:</strong> Pending confirmation from provider</p>
        </div>
        <p>You will receive another email once your provider confirms the appointment.</p>
        <p>If you need to cancel or reschedule, please log in to the platform.</p>
        <br>
        <p>Kind regards,</p>
        <p><strong>Telehealth Platform Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send cancellation email
const sendCancellationEmail = async (toEmail, patientName, appointmentDatetime) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Appointment Cancelled — Telehealth Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53e3e;">Appointment Cancelled ❌</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been cancelled. Here are the details:</p>
        <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date & Time:</strong> ${new Date(appointmentDatetime).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        <p>If you'd like to book a new appointment, please log in to the platform.</p>
        <br>
        <p>Kind regards,</p>
        <p><strong>Telehealth Platform Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send rescheduled email
const sendRescheduledEmail = async (toEmail, patientName, providerName, newDatetime) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Appointment Rescheduled — Telehealth Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d69e2e;">Appointment Rescheduled 🔄</h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment has been rescheduled. Here are your new details:</p>
        <div style="background: #fffff0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Provider:</strong> ${providerName}</p>
          <p><strong>New Date & Time:</strong> ${new Date(newDatetime).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <p><strong>Status:</strong> Pending confirmation from provider</p>
        </div>
        <p>If you need to make further changes, please log in to the platform.</p>
        <br>
        <p>Kind regards,</p>
        <p><strong>Telehealth Platform Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send status update email (confirmed/completed)
const sendStatusUpdateEmail = async (toEmail, patientName, providerName, appointmentDatetime, status) => {
  const isConfirmed = status === 'Confirmed';
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Appointment ${status} — Telehealth Platform`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isConfirmed ? '#2c7a7b' : '#718096'};">
          Appointment ${status} ${isConfirmed ? '✅' : '🏁'}
        </h2>
        <p>Dear ${patientName},</p>
        <p>Your appointment status has been updated.</p>
        <div style="background: #f0f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Provider:</strong> ${providerName}</p>
          <p><strong>Date & Time:</strong> ${new Date(appointmentDatetime).toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })}</p>
          <p><strong>Status:</strong> ${status}</p>
        </div>
        <br>
        <p>Kind regards,</p>
        <p><strong>Telehealth Platform Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail,
  sendRescheduledEmail,
  sendStatusUpdateEmail
};