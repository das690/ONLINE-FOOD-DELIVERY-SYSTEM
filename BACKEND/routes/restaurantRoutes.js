// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createRestaurant, 
  getRestaurants, 
  getRestaurantById, 
  addMenuItem 
} = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes (Customers browsing)
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes (Only owners/admins can create or edit)
router.post('/', protect, restrictTo('restaurant_owner', 'admin'), createRestaurant);
router.post('/:id/menu', protect, restrictTo('restaurant_owner', 'admin'), addMenuItem);

module.exports = router;