const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, required: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  maxDiscount: { type: Number, default: 150 },
  minOrderAmount: { type: Number, default: 199 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);

