// controllers/paymentController.js
const Razorpay = require('razorpay');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private (Customer)
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // 1. Fetch the order from the database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Razorpay expects amounts in paise (multiply INR by 100)
    const amountInPaise = Math.round(order.totalAmount * 100);

    // 3. Create the order in Razorpay
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString(), // Connect Razorpay order to your DB order ID
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4. Send the order details to the frontend
    res.status(200).json({
      success: true,
      order: razorpayOrder,
    });

  } catch (error) {
    console.error('Razorpay error:', error);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
};