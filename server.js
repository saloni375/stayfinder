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

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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