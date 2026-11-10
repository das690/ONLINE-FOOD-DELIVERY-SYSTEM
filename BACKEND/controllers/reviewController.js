const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// @desc    Add review for a restaurant
// @route   POST /api/reviews
exports.addReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;

    if (!restaurantId || !rating || !comment) {
      return res.status(400).json({ message: 'Restaurant, rating (1-5), and comment are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const review = new Review({
      user: req.user._id,
      userName: req.user.name,
      restaurant: restaurantId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await review.save();

    // Recalculate average restaurant rating
    const allReviews = await Review.find({ restaurant: restaurantId });
    const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);

    restaurant.rating = Number(avgRating);
    restaurant.numRatings = allReviews.length;
    await restaurant.save();

    res.status(201).json({ review, restaurantRating: restaurant.rating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/:restaurantId
exports.getReviewsByRestaurant = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

