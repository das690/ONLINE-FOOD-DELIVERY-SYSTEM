const express = require('express');
const router = express.Router();
const { addReview, getReviewsByRestaurant } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:restaurantId', getReviewsByRestaurant);
router.post('/', protect, addReview);

module.exports = router;

