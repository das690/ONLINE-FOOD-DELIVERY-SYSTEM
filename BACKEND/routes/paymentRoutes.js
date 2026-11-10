// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createPaymentOrder } = require('../controllers/paymentController'); // Updated
const { protect } = require('../middleware/authMiddleware');

// Route to initiate Razorpay payment
router.post('/create-order', protect, createPaymentOrder); // Updated URL and function

module.exports = router;