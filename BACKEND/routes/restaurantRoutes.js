const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantMeta,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getRestaurants);
router.get('/meta', getRestaurantMeta);
router.get('/:id', getRestaurantById);

// Owner / Admin protected routes
router.post('/', protect, restrictTo('restaurant_owner', 'admin'), createRestaurant);
router.put('/:id', protect, restrictTo('restaurant_owner', 'admin'), updateRestaurant);
router.delete('/:id', protect, restrictTo('restaurant_owner', 'admin'), deleteRestaurant);

// Menu management
router.post('/:id/menu', protect, restrictTo('restaurant_owner', 'admin'), addMenuItem);
router.put('/:id/menu/:itemId', protect, restrictTo('restaurant_owner', 'admin'), updateMenuItem);
router.delete('/:id/menu/:itemId', protect, restrictTo('restaurant_owner', 'admin'), deleteMenuItem);

module.exports = router;
