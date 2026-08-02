const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { propertyId, type, checkIn, checkOut, guests } = req.body;

    // Prevent double-booking: check for overlapping dates on the same property
    if (checkIn && checkOut) {
      const overlapping = await Booking.findOne({
        propertyId,
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      });

      if (overlapping) {
        return res.status(409).json({
          error: 'This property is already booked for the selected dates',
        });
      }
    }

    const newBooking = new Booking({
      userId: req.userId,
      propertyId,
      type,
      checkIn,
      checkOut,
      guests,
    });
    const saved = await newBooking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', message: err.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).populate('propertyId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;