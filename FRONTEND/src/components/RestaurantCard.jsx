import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart, MapPin, Sparkles } from 'lucide-react';
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
    <Link to={`/restaurant/${restaurant._id}`} className="block group focus:outline-none">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 transform group-hover:-translate-y-1.5 border border-surface-200/80 flex flex-col h-full relative">
        {/* Restaurant Image with Badges */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-surface-100">
          <img
            src={restaurant.imageUrl || defaultImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

          {/* Discount Ribbon */}
          {restaurant.discountText && (
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-brand-600 to-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>{restaurant.discountText}</span>
            </div>
          )}

          {/* Delivery Time Badge */}
          <div className="absolute top-3 left-3 bg-surface-950/75 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1.5 shadow-sm border border-white/10">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{restaurant.deliveryTime || '25-35 mins'}</span>
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-surface-700 hover:text-rose-500 hover:scale-110 transition shadow-sm active:scale-90 touch-target border border-white/40"
            aria-label="Save as favorite"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-surface-600'}`} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          {/* Title & Rating */}
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-black text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-1 leading-tight">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-xs flex-shrink-0">
              <span>{restaurant.rating || 4.2}</span>
              <Star className="w-3 h-3 fill-white text-white" />
            </div>
          </div>

          {/* Cuisines */}
          <p className="text-surface-500 text-xs mb-3.5 line-clamp-1 font-medium">
            {cuisinesText}
          </p>

          {/* Footer Metadata */}
          <div className="mt-auto pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-surface-600">
            <div className="flex items-center space-x-1 truncate max-w-[150px] font-medium text-surface-500">
              <MapPin className="w-3.5 h-3.5 text-surface-400 shrink-0" />
              <span className="truncate">{restaurant.location}</span>
            </div>
            <span className="font-extrabold text-surface-900 shrink-0">
              ₹{restaurant.priceForTwo || 350} for two
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
