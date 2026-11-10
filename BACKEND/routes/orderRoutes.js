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
router.get('/myorders', protect, getMyOrders);
router.get('/restaurant/:restaurantId', protect, restrictTo('restaurant_owner', 'admin'), getRestaurantOrders);
router.get('/all', protect, restrictTo('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);

// Status and tracking
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/location', protect, updateDeliveryLocation);

module.exports = router;
