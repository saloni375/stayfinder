const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,            
  image: String,
  location: String,
  price: Number,
  rating: Number,           
  description: String
});

module.exports = mongoose.model('Property', propertySchema);
