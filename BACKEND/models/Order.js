const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId },
  menuItemName: { type: String, required: true },
  name: { type: String }, // alias for backward compatibility
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  isVeg: { type: Boolean, default: true },
  specialInstructions: { type: String, default: '' }
}, { _id: false });

const statusTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 40 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  statusTimeline: [statusTimelineSchema],
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'upi'],
    default: 'razorpay'
  },
  paymentDetails: {
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    paidAt: { type: Date }
  },
  deliveryAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    phone: { type: String, default: '' },
    fullAddress: { type: String, default: '' }
  },
  deliveryPartner: {
    name: { type: String, default: 'Rahul Verma' },
    phone: { type: String, default: '+91 98765 43210' },
    vehicleNumber: { type: String, default: 'KA-01-EA-2024' },
    rating: { type: Number, default: 4.8 },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
  },
  deliveryCoordinates: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
    progressPercent: { type: Number, default: 10 }
  },
  estimatedDeliveryMinutes: { type: Number, default: 30 },
  scheduledDeliveryTime: { type: Date },
  specialInstructions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
