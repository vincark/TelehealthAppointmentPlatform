const pool = require('../config/db');

const createNotification = async (user_id, appointment_id, message, notification_type) => {
  await pool.query(
    `INSERT INTO notifications (user_id, appointment_id, message, notification_type)
     VALUES ($1, $2, $3, $4)`,
    [user_id, appointment_id, message, notification_type]
  );
};

module.exports = { createNotification };