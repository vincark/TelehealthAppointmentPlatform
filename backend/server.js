const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./src/config/passport');

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

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./src/routes/auth');
const googleAuthRoutes = require('./src/routes/googleAuth');
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);

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

const adminRoutes = require('./src/routes/admin');
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Telehealth API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});