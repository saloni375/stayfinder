const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Experience = require('../models/Experience');


const ONE_DAY = 24 * 60 * 60 * 1000;
const MAX_NIGHTS = 30;
const MAX_GUESTS = 10;

const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { propertyId, type, checkIn, checkOut, guests } = req.body;

    // 1. Basic checks
       if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId) || !['stay', 'experience'].includes(type)) {
      return res.status(400).json({ error: 'Invalid booking details' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Please select valid dates' });
    }

    // 2. Date rules
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }
    if (end <= start) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }
    if (type === 'stay' && (end - start) / ONE_DAY > MAX_NIGHTS) {
      return res.status(400).json({ error: `You can book at most ${MAX_NIGHTS} nights` });
    }

    // 3. Guests rule
    const guestCount = Number(guests) || 1;
    if (guestCount < 1 || guestCount > MAX_GUESTS) {
      return res.status(400).json({ error: `Guests must be between 1 and ${MAX_GUESTS}` });
    }

    // 4. Make sure the stay / experience really exists
    const Model = type === 'stay' ? Property : Experience;
    const item = await Model.findById(propertyId);
    if (!item) {
      return res.status(404).json({ error: 'This listing does not exist' });
    }

    // 5. Prevent double-booking (stays only: many people can join the same experience)
    //    Two bookings overlap if: existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
    if (type === 'stay') {
      const overlapping = await Booking.findOne({
        propertyId,
        type: 'stay',
        checkIn: { $lt: end },
        checkOut: { $gt: start },
      });

      if (overlapping) {
        return res.status(409).json({
          error: 'This property is already booked for the selected dates',
        });
      }
    }

    // 6. Save the booking
    const newBooking = new Booking({
      userId: req.userId,
      propertyId,
      type,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
    });
    const saved = await newBooking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Booking failed', message: err.message });
  }
});

// Get the logged-in user's bookings, with the stay or experience details attached
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ checkIn: -1 }).lean();

    // A booking can point to a Property OR an Experience, so look each one up in the right collection
    const stayIds = bookings.filter(b => b.type === 'stay').map(b => b.propertyId);
    const expIds = bookings.filter(b => b.type === 'experience').map(b => b.propertyId);

    const [stays, experiences] = await Promise.all([
      Property.find({ _id: { $in: stayIds } }).lean(),
      Experience.find({ _id: { $in: expIds } }).lean(),
    ]);

    // Make a quick lookup: id -> item
    const byId = {};
    [...stays, ...experiences].forEach(item => { byId[String(item._id)] = item; });

    // Keep the same shape as before: booking.propertyId is the full item
    const result = bookings.map(b => ({ ...b, propertyId: byId[String(b.propertyId)] || null }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Cancel (delete) one of your own bookings
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // 1. Is the ID valid?
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    // 2. Does the booking exist?
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // 3. Is it YOUR booking?
    if (String(booking.userId) !== String(req.userId)) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }

    // 4. Is it in the future? (You can't cancel a stay that already happened)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (booking.checkIn < today) {
      return res.status(400).json({ error: 'Past bookings cannot be cancelled' });
    }

    // 5. Delete it (the dates become free for other users again)
    await booking.deleteOne();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Cancel booking error:', err.message);
    
  }
});

module.exports = router;