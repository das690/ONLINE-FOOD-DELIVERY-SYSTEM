const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, // Home, Work, Other
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  phone: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'restaurant_owner', 'admin', 'delivery'], 
    default: 'customer' 
  },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  address: { type: String, default: '' }, // Legacy string address fallback
  savedAddresses: [addressSchema],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
