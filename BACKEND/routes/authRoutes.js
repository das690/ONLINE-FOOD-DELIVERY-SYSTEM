const express = require('express');
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

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.post('/favorites/:restaurantId', protect, toggleFavorite);

module.exports = router;
