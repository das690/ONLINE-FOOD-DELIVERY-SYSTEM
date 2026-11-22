const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  updateDeliveryLocation
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);

// IMPORTANT: Specific string routes MUST come BEFORE parameterized /:id routes
router.get('/myorders', protect, getMyOrders);
router.get('/all', protect, restrictTo('admin'), getAllOrders);
router.get('/restaurant/:restaurantId', protect, restrictTo('restaurant_owner', 'admin'), getRestaurantOrders);

// Parameterized route — must be AFTER /myorders and /all
router.get('/:id', protect, getOrderById);

// Status and tracking — restricted to owners and admins
router.put('/:id/status', protect, restrictTo('restaurant_owner', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/location', protect, updateDeliveryLocation);

module.exports = router;
