const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register,
  login,
  demoLogin,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  toggleFavorite,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rate limiter for auth endpoints — 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/demo-login', demoLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.post('/favorites/:restaurantId', protect, toggleFavorite);

module.exports = router;
