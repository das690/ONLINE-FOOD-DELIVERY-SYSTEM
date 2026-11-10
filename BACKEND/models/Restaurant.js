const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: 'Main Course' }, // Starters, Main Course, Breads, Biryani, Desserts, Beverages
  nutritionalInfo: { type: String, default: '' },
  image: { type: String, default: '' },
  isVeg: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: { type: String, required: true }, // City / Neighborhood
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  cuisine: [{ type: String, trim: true }],
  rating: { type: Number, default: 4.2, min: 0, max: 5 },
  numRatings: { type: Number, default: 120 },
  deliveryTime: { type: String, default: '25-35 mins' },
  minimumOrder: { type: Number, default: 100 },
  priceForTwo: { type: Number, default: 350 },
  isOpen: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  discountText: { type: String, default: '50% OFF up to ₹100' },
  hoursOfOperation: { type: String, default: '10:00 AM - 11:00 PM' },
  imageUrl: { type: String, default: '' },
  menu: [menuItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
