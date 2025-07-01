const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find();
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Experience not found' });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});


router.post('/', async (req, res) => {
  const newExp = new Experience({
    title: req.body.title,
    location: req.body.location,
    price: req.body.price,
    rating: req.body.rating,
    duration: req.body.duration,
    isNew: req.body.isNew,
    image: req.body.image
  });

  try {
    const savedExp = await newExp.save();
    res.status(201).json(savedExp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
