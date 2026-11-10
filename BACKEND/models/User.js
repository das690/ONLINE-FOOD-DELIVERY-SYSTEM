// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'restaurant_owner', 'admin'], 
    default: 'customer' 
  },
  phone: { type: String },
  address: { type: String } // Can be expanded to a complex object later
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);