const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  duration: { type: String, required: true }, // Example: '2 hours'
  isNew: { type: Boolean, default: false },
  image: { type: String, required: true }
});

module.exports = mongoose.model('Experience', experienceSchema);
