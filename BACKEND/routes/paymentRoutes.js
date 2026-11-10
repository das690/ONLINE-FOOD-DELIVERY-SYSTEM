const express = require('express');
const router = express.Router();
const {
  getRazorpayKey,
  createPaymentOrder,
  verifyPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/key', getRazorpayKey);
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
