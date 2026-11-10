// models/Restaurant.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String }, // e.g., "Starters", "Mains"
  nutritionalInfo: { type: String }, // e.g., "500 kcal, Vegan"
  image: { type: String } 
});

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, default: 0 },
  hoursOfOperation: { type: String },
  imageUrl: { type: String },
  menu: [menuItemSchema] // Embedding the menu items here
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);