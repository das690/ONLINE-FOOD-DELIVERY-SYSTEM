import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavoriteLocal } from '../redux/authSlice';
import api from '../utils/api';

const RestaurantCard = ({ restaurant }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, favorites } = useSelector((state) => state.auth);
  const isFav = favorites.includes(restaurant._id);

  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please log in to save favorite restaurants');
      return;
    }

    try {
      dispatch(toggleFavoriteLocal(restaurant._id));
      await api.post(`/auth/favorites/${restaurant._id}`);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const cuisinesText = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(', ')
    : (restaurant.cuisine || 'Multi-Cuisine');

  return (
    <Link to={`/restaurant/${restaurant._id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1.5 border border-gray-100 flex flex-col h-full">
        {/* Restaurant Image with Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={restaurant.imageUrl || defaultImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Discount Ribbon */}
          {restaurant.discountText && (
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
              {restaurant.discountText}
            </div>
          )}

          {/* Delivery Time Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{restaurant.deliveryTime || '25-35 mins'}</span>
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-rose-500 transition shadow-sm active:scale-90"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title & Rating */}
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-xs flex-shrink-0">
              <span>{restaurant.rating || 4.2}</span>
              <Star className="w-3 h-3 fill-white text-white" />
            </div>
          </div>

          {/* Cuisines */}
          <p className="text-gray-500 text-xs mb-3 line-clamp-1">
            {cuisinesText}
          </p>

          {/* Footer Metadata */}
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span className="truncate max-w-[140px] font-medium">{restaurant.location}</span>
            <span className="font-semibold text-gray-900">₹{restaurant.priceForTwo || 350} for two</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
