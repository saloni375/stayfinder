const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const propertyRoutes = require('./routes/propertyRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();
// Render sits in front of our app as a proxy, so read the real user IP from it
app.set('trust proxy', 1);

// Only these websites can call this API from a browser
const allowedOrigins = [
  'http://localhost:3000',                      // local development
  'https://stayfinder-frontend-eta.vercel.app', // live frontend
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('🌍 Welcome to the StayFinder API');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});