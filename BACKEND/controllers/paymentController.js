const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay instance lazily/safely from env vars
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// @desc    Get Razorpay Public Key
// @route   GET /api/payments/key
exports.getRazorpayKey = (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(503).json({ message: 'Payment gateway key not configured' });
  }
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${order._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        orderId: order._id.toString(),
        customer: order.customer.toString()
      }
    };

    try {
      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        throw new Error('Razorpay credentials not configured');
      }
      const razorpayOrder = await razorpay.orders.create(options);
      order.paymentDetails.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(200).json({
        success: true,
        order: razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (rzpErr) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Razorpay API error in production:', rzpErr.message);
        return res.status(502).json({ message: 'Payment gateway unavailable. Please try again later.' });
      }
      console.warn('Razorpay API error, falling back to simulated order:', rzpErr.message);
      // Fallback for offline/test simulation in non-production
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: options.receipt
      };
      order.paymentDetails.razorpayOrderId = mockOrder.id;
      await order.save();

      return res.status(200).json({
        success: true,
        order: mockOrder,
        key: process.env.RAZORPAY_KEY_ID || '',
        isSimulated: true
      });
    }
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulated
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (isSimulated) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ success: false, message: 'Simulated payments are disabled in production' });
      }
      order.paymentStatus = 'Completed';
      order.status = 'Confirmed';
      order.paymentDetails.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
      order.paymentDetails.paidAt = new Date();
      order.statusTimeline.push({
        status: 'Confirmed',
        timestamp: new Date(),
        note: 'Payment verified successfully (Simulated mode)'
      });
      await order.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`order_${order._id}`).emit('statusUpdate', { orderId: order._id, status: 'Confirmed' });
      }

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    }

    // Real signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Payment gateway secret is not configured' });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters' });
    }
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      order.paymentStatus = 'Completed';
      order.status = 'Confirmed';
      order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
      order.paymentDetails.paidAt = new Date();
      order.statusTimeline.push({
        status: 'Confirmed',
        timestamp: new Date(),
        note: `Payment verified. ID: ${razorpay_payment_id}`
      });

      await order.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`order_${order._id}`).emit('statusUpdate', { orderId: order._id, status: 'Confirmed' });
      }

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      order.paymentStatus = 'Failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};
