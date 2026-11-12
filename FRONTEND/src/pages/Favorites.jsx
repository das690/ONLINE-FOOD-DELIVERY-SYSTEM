import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import { Heart, ArrowLeft, UtensilsCrossed } from 'lucide-react';

const Favorites = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.favorites) {
          setFavoriteRestaurants(response.data.favorites);
        }
      } catch (err) {
        console.error('Failed to load favorites', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
      <div className="flex items-center space-x-2 text-rose-500 mb-2">
        <Heart className="w-5 h-5 fill-rose-500" />
        <span className="text-xs font-black uppercase tracking-wider">Your Curated Collection</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight mb-8">
        Saved Favorite Restaurants
      </h1>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-surface-500 font-bold">Loading favorites...</p>
        </div>
      ) : favoriteRestaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-surface-200 shadow-xs max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-surface-900 mb-1">No favorite restaurants yet</h3>
          <p className="text-xs sm:text-sm text-surface-500 mb-6 font-medium leading-relaxed">
            Tap the heart icon on any restaurant card to save your top craving destinations for lightning one-tap access!
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-brand-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-brand-500/25 hover:bg-brand-600 transition touch-target"
          >
            <span>Explore Restaurants</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {favoriteRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
