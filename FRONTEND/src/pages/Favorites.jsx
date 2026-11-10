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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-2 text-rose-500 mb-2">
        <Heart className="w-5 h-5 fill-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider">Your Curated Collection</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">
        Saved Favorite Restaurants
      </h1>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-bold">Loading favorites...</p>
        </div>
      ) : favoriteRestaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-12">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No favorite restaurants yet</h3>
          <p className="text-xs text-gray-500 mb-6">
            Tap the heart icon on any restaurant card to save your top craving destinations!
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
          >
            <span>Explore Restaurants</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

