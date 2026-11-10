// controllers/restaurantController.js
const Restaurant = require('../models/Restaurant');

// @desc    Create a new restaurant profile
// @route   POST /api/restaurants
// @access  Private (restaurant_owner only)
exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, location, cuisine, hoursOfOperation, imageUrl } = req.body;

    // Create restaurant and link it to the logged-in user
    const restaurant = new Restaurant({
      owner: req.user._id, // Got this from the auth middleware
      name,
      description,
      location,
      cuisine,
      hoursOfOperation,
      imageUrl
    });

    const savedRestaurant = await restaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all restaurants (with optional search/filter)
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    // Basic search filtering (e.g., /api/restaurants?cuisine=Italian)
    const query = {};
    if (req.query.cuisine) query.cuisine = req.query.cuisine;
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };

    const restaurants = await Restaurant.find(query);
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single restaurant and its menu
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a menu item to a restaurant
// @route   POST /api/restaurants/:id/menu
// @access  Private (restaurant_owner only)
exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Security Check: Make sure the logged-in user actually owns this restaurant
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this restaurant' });
    }

    const { name, description, price, category, nutritionalInfo, image } = req.body;

    const newMenuItem = { name, description, price, category, nutritionalInfo, image };
    restaurant.menu.push(newMenuItem); // Add item to the array
    
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};