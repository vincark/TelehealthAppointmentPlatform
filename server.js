const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./src/config/db');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again in 15 minutes' }
});

app.use('/api/auth/login', loginLimiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);

const availabilityRoutes = require('./src/routes/availability');
app.use('/api/availability', availabilityRoutes);

const appointmentRoutes = require('./src/routes/appointments');
app.use('/api/appointments', appointmentRoutes);

const userRoutes = require('./src/routes/users');
app.use('/api/users', userRoutes);

const notificationRoutes = require('./src/routes/notifications');
app.use('/api/notifications', notificationRoutes);

const providerRoutes = require('./src/routes/providers');
app.use('/api/providers', providerRoutes);

const reportRoutes = require('./src/routes/reports');
app.use('/api/reports', reportRoutes);

const ratingRoutes = require('./src/routes/ratings');
app.use('/api/ratings', ratingRoutes);

const adminRoutes = require('./src/routes/admin');
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
  res.send('Telehealth API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});