import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Star,
  Clock,
  MapPin,
  Search,
  Percent,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Send,
  X,
  Heart
} from 'lucide-react';
import api from '../utils/api';
import MenuItem from '../components/MenuItem';

const RestaurantDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { items, totalAmount, restaurantId: cartRestaurantId } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchRestaurant = async () => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      setRestaurant(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to write a review');
      return;
    }
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        restaurantId: id,
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccess('Thank you! Your review has been published.');
      setReviewComment('');
      fetchRestaurant();
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-surface-500 font-bold">Loading delicious menu...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-center shadow-sm">
        <p className="font-bold text-lg mb-4">{error || 'Restaurant not found'}</p>
        <Link to="/" className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold inline-block">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  // Extract unique categories from menu
  const categories = ['All', ...new Set((restaurant.menu || []).map((m) => m.category).filter(Boolean))];

  // Filter menu items
  const filteredMenu = (restaurant.menu || []).filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = isVegOnly ? item.isVeg : true;

    return matchesSearch && matchesCategory && matchesVeg;
  });

  const isCartFromThisRestaurant = cartRestaurantId === restaurant._id && items.length > 0;
  const cuisinesText = Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-36">
      {/* Restaurant Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-surface-200/80 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-60 h-48 sm:h-52 rounded-2xl overflow-hidden shadow-inner bg-surface-100 shrink-0 relative group">
            <img
              src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {restaurant.discountText && (
              <div className="absolute bottom-3 left-3 bg-gradient-to-r from-brand-600 to-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                {restaurant.discountText}
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 tracking-tight leading-tight">
                {restaurant.name}
              </h1>
              <div className="flex items-center space-x-1.5 bg-emerald-600 text-white px-3 py-1 rounded-xl font-black text-sm shadow-sm shrink-0">
                <span>{restaurant.rating || 4.2}</span>
                <Star className="w-4 h-4 fill-white" />
              </div>
            </div>

            <p className="text-surface-600 text-sm font-semibold mb-2">{cuisinesText}</p>
            <p className="text-surface-400 text-xs flex items-center space-x-1.5 mb-4 font-medium">
              <MapPin className="w-3.5 h-3.5 text-surface-400 shrink-0" />
              <span>{restaurant.address?.street ? `${restaurant.address.street}, ${restaurant.location}` : restaurant.location}</span>
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-surface-700 pt-3 border-t border-surface-100">
              <div className="flex items-center space-x-1.5 text-surface-800">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{restaurant.deliveryTime || '25-35 mins'}</span>
              </div>
              <span className="text-surface-300">•</span>
              <div>
                <span>₹{restaurant.priceForTwo || 350} for two</span>
              </div>
              <span className="text-surface-300">•</span>
              <div className="text-emerald-600 font-extrabold">
                <span>{restaurant.numRatings || 120}+ reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Strip */}
        {restaurant.discountText && (
          <div className="mt-6 pt-4 border-t border-surface-100 flex items-center space-x-3 text-brand-700 bg-brand-50/70 p-3.5 rounded-2xl border border-brand-200/60">
            <Percent className="w-5 h-5 text-brand-500 shrink-0" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
              {restaurant.discountText}
            </span>
          </div>
        )}
      </div>

      {/* Sticky Menu Controls: Search, Category Tabs, Veg Switch */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-sm border border-surface-200/90 mb-8 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Menu Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in menu..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Pure Veg Toggle Switch */}
            <label className="flex items-center space-x-2 cursor-pointer select-none touch-target">
              <input
                type="checkbox"
                checked={isVegOnly}
                onChange={(e) => setIsVegOnly(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${isVegOnly ? 'bg-emerald-500' : 'bg-surface-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isVegOnly ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-black text-surface-700">Veg Only</span>
            </label>

            {/* Write Review Button */}
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs font-extrabold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 touch-target"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Add Review</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 touch-target ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25 scale-102'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="mb-14">
        <h2 className="text-xl font-black text-surface-900 mb-6 flex items-center space-x-2">
          <span>Menu</span>
          <span className="text-xs bg-brand-100 text-brand-700 font-extrabold px-2.5 py-0.5 rounded-full">
            {filteredMenu.length} items
          </span>
        </h2>

        {filteredMenu.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-surface-200 shadow-xs">
            <p className="text-surface-500 font-bold text-sm">No dishes match your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredMenu.map((item) => (
              <MenuItem
                key={item._id}
                item={item}
                restaurantId={restaurant._id}
                restaurantName={restaurant.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200/80 shadow-xs">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h3 className="text-xl font-black text-surface-900">Customer Reviews</h3>
            <p className="text-xs text-surface-500">Genuine feedback from verified foodies</p>
          </div>
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="text-xs font-black text-brand-600 border border-brand-500 px-4 py-2 rounded-xl hover:bg-brand-50 transition touch-target"
          >
            Rate Food
          </button>
        </div>

        {restaurant.reviews && restaurant.reviews.length > 0 ? (
          <div className="space-y-4">
            {restaurant.reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-surface-50 border border-surface-200/70">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-black text-surface-900">{rev.userName}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    <span>{rev.rating}</span>
                    <Star className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed font-medium">{rev.comment}</p>
                <span className="text-[10px] text-surface-400 mt-2 block font-medium">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-surface-400 italic">No reviews yet. Be the first to review this restaurant!</p>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {isCartFromThisRestaurant && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] sm:w-[88%] bg-surface-900/95 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-surface-700 animate-slideUp">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-bold uppercase tracking-wider">{items.length} items added</p>
              <p className="text-sm font-black text-white">₹{totalAmount} (approx)</p>
            </div>
          </div>
          <Link
            to="/cart"
            className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 font-black text-xs px-5 py-2.5 rounded-xl transition active:scale-95 shadow-md shadow-brand-500/30"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Add Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-surface-200 animate-scaleIn">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 touch-target"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-surface-900 mb-1">Rate your experience</h3>
            <p className="text-xs text-surface-500 mb-4">{restaurant.name}</p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-center text-xs font-black">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-surface-700 mb-2">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none touch-target"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-surface-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-surface-700 mb-1">Your feedback</label>
                  <textarea
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other foodies what dishes you loved..."
                    className="w-full p-3 border border-surface-200 rounded-2xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/25 transition touch-target"
                >
                  {reviewSubmitting ? 'Publishing...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails;
