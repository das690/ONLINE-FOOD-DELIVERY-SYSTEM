// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  placeOrder, 
  updateOrderStatus, 
  getMyOrders,
  getRestaurantOrders // NEW IMPORT
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Customer routes
router.post('/', protect, placeOrder);
router.get('/myorders', protect, getMyOrders);

// Restaurant Owner / Admin routes
router.put('/:id/status', protect, restrictTo('restaurant_owner', 'admin'), updateOrderStatus);
router.get('/restaurant/:restaurantId', protect, restrictTo('restaurant_owner', 'admin'), getRestaurantOrders); // NEW ROUTE

module.exports = router;