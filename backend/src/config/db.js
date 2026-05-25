const { Pool, types } = require('pg');
require('dotenv').config();

// PostgreSQL stores availability slots as TIMESTAMP WITHOUT TIME ZONE.
// The pg library treats these as local time by default, shifting them by +10h (AEST).
// This override tells pg to treat them as UTC so dates/times display correctly.
types.setTypeParser(1114, str => new Date(str.replace(' ', 'T') + 'Z'));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch((err) => console.error('Database connection error:', err));

module.exports = pool;