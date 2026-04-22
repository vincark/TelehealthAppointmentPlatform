const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Helper function to create a notification
const createNotification = async (user_id, appointment_id, message, notification_type) => {
  await pool.query(
    `INSERT INTO notifications (user_id, appointment_id, message, notification_type)
     VALUES ($1, $2, $3, $4)`,
    [user_id, appointment_id, message, notification_type]
  );
};

// Get all notifications for logged in user
router.get('/my', verifyToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY sent_at DESC`,
      [user_id]
    );

    res.json({ notifications: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/read/:notification_id', verifyToken, async (req, res) => {
  const { notification_id } = req.params;
  const { user_id } = req.user;

  try {
    const notification = await pool.query(
      `SELECT * FROM notifications WHERE notification_id = $1`,
      [notification_id]
    );

    if (notification.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.rows[0].user_id !== user_id) {
      return res.status(403).json({ message: 'You can only read your own notifications' });
    }

    await pool.query(
      `UPDATE notifications SET is_read = true WHERE notification_id = $1`,
      [notification_id]
    );

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

module.exports.createNotification = createNotification;