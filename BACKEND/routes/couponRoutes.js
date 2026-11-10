const express = require('express');
const router = express.Router();
const { getCoupons, applyCoupon, createCoupon } = require('../controllers/couponController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getCoupons);
router.post('/apply', applyCoupon);
router.post('/', protect, restrictTo('admin'), createCoupon);

module.exports = router;

