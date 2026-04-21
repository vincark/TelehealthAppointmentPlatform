const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./src/config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/auth');
const availabilityRoutes = require('./src/routes/availability');
app.use('/api/availability', availabilityRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Telehealth API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});