const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

// @desc    Get all restaurants with filters, search, sort
// @route   GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating, isVeg, sort, location } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'menu.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisine && cuisine !== 'All') {
      query.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (isVeg === 'true') {
      // Find restaurants where at least some items are pure veg or cuisine includes Veg
      query['menu.isVeg'] = true;
    }

    let sortOption = { rating: -1 };
    if (sort === 'delivery_asc') {
      sortOption = { deliveryTime: 1 };
    } else if (sort === 'price_asc') {
      sortOption = { priceForTwo: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { priceForTwo: -1 };
    } else if (sort === 'rating_desc') {
      sortOption = { rating: -1 };
    }

    const restaurants = await Restaurant.find(query).sort(sortOption);

    res.status(200).json(restaurants);
  } catch (error) {
    console.error('getRestaurants error:', error);
    res.status(500).json({ message: 'Failed to fetch restaurants', error: error.message });
  }
};

// @desc    Get list of unique cuisines and cities
// @route   GET /api/restaurants/meta
exports.getRestaurantMeta = async (req, res) => {
  try {
    const cuisines = await Restaurant.distinct('cuisine');
    const locations = await Restaurant.distinct('location');
    res.status(200).json({ cuisines, locations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch metadata', error: error.message });
  }
};

// @desc    Get single restaurant by ID with reviews
// @route   GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Fetch reviews for this restaurant
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      ...restaurant.toObject(),
      reviews
    });
  } catch (error) {
    console.error('getRestaurantById error:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant', error: error.message });
  }
};

// @desc    Create new restaurant profile
// @route   POST /api/restaurants
exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      address,
      cuisine,
      deliveryTime,
      minimumOrder,
      priceForTwo,
      discountText,
      hoursOfOperation,
      imageUrl,
      menu
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }

    const restaurant = new Restaurant({
      owner: req.user._id,
      name: name.trim(),
      description: description || '',
      location: location.trim(),
      address: address || {},
      cuisine: Array.isArray(cuisine) ? cuisine : (cuisine ? cuisine.split(',').map(c => c.trim()) : ['Multi-Cuisine']),
      deliveryTime: deliveryTime || '25-35 mins',
      minimumOrder: minimumOrder || 100,
      priceForTwo: priceForTwo || 350,
      discountText: discountText || '50% OFF up to ₹100',
      hoursOfOperation: hoursOfOperation || '10:00 AM - 11:00 PM',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      menu: menu || []
    });

    const savedRestaurant = await restaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (error) {
    console.error('createRestaurant error:', error);
    res.status(500).json({ message: 'Failed to create restaurant', error: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Authorization: owner or admin
    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this restaurant' });
    }

    Object.assign(restaurant, req.body);
    const updated = await restaurant.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update restaurant', error: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Restaurant removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete restaurant', error: error.message });
  }
};

// @desc    Add menu item to restaurant
// @route   POST /api/restaurants/:id/menu
exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this restaurant menu' });
    }

    const { name, description, price, category, nutritionalInfo, image, isVeg, isBestseller } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Item name and price are required' });
    }

    restaurant.menu.push({
      name: name.trim(),
      description: description || '',
      price: Number(price),
      category: category || 'Main Course',
      nutritionalInfo: nutritionalInfo || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      isVeg: isVeg !== undefined ? isVeg : true,
      isBestseller: !!isBestseller
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add menu item', error: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/:id/menu/:itemId
exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    Object.assign(item, req.body);
    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:id/menu/:itemId
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (restaurant.owner && restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    restaurant.menu = restaurant.menu.filter(m => m._id.toString() !== req.params.itemId);
    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
  }
};
