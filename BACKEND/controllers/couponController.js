const Coupon = require('../models/Coupon');

// @desc    Get all active coupons
// @route   GET /api/coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    }).sort({ discountPercent: -1 });

    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
};

// @desc    Apply and validate coupon
// @route   POST /api/coupons/apply
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
      });
    }

    const calculatedDiscount = Math.min(
      Math.round((orderTotal * coupon.discountPercent) / 100),
      coupon.maxDiscount || 150
    );

    res.status(200).json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: calculatedDiscount,
      message: `Coupon applied! You saved ₹${calculatedDiscount}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply coupon', error: error.message });
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const { code, description, discountPercent, maxDiscount, minOrderAmount, expiresAt } = req.body;
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      description,
      discountPercent: Number(discountPercent),
      maxDiscount: maxDiscount ? Number(maxDiscount) : 150,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 199,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

