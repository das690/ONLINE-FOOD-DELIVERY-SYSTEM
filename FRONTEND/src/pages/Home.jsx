import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, MapPin, Sparkles, Flame, Clock, Award } from 'lucide-react';
import api from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import CategoryBar from '../components/CategoryBar';
import FilterBar from '../components/FilterBar';

const Home = () => {
  const { selectedCity } = useSelector((state) => state.auth);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [filters, setFilters] = useState({
    vegOnly: false,
    fastDelivery: false,
    minRating: 0,
    sort: 'relevance'
  });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeCategory && activeCategory !== 'All') params.cuisine = activeCategory;
      if (filters.minRating > 0) params.minRating = filters.minRating;
      if (filters.vegOnly) params.isVeg = true;
      if (filters.sort !== 'relevance') params.sort = filters.sort;

      const response = await api.get('/restaurants', { params });
      setRestaurants(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch restaurants error:', err);
      setError('Could not connect to backend server. Make sure BACKEND is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCity, activeCategory, filters.vegOnly, filters.minRating, filters.sort]);

  // Client-side debounce for search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRestaurants();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleResetFilters = () => {
    setFilters({
      vegOnly: false,
      fastDelivery: false,
      minRating: 0,
      sort: 'relevance'
    });
    setActiveCategory('All');
    setSearchTerm('');
  };

  // Additional client filtering for fast delivery (<30 min)
  const displayedRestaurants = restaurants.filter(r => {
    if (filters.fastDelivery) {
      const timeMatch = (r.deliveryTime || '').match(/\d+/);
      const deliveryNum = timeMatch ? parseInt(timeMatch[0], 10) : 30;
      return deliveryNum <= 25;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Search Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 p-8 sm:p-12 text-white">
        {/* Background Decorative Rings */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute left-10 -top-10 w-40 h-40 rounded-full bg-amber-400/20 blur-xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-orange-100 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Delivering across {selectedCity}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Craving something delicious?
          </h1>
          <p className="text-base sm:text-lg text-orange-100 mb-8 font-medium">
            Order from top gourmet kitchens, popular street hubs, and trending dessert bars near you.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-2 shadow-xl flex items-center text-gray-800 border border-white/40">
            <div className="pl-3 pr-2 text-orange-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for biryani, pizza, rolls, or restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-2 px-2 text-sm sm:text-base outline-none text-gray-800 placeholder-gray-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 font-bold"
              >
                Clear
              </button>
            )}
            <button
              onClick={fetchRestaurants}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-md active:scale-95 text-sm"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Cuisine Story Circles: "What's on your mind?" */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      {/* Promotional Value Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            %
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm">UP TO 50% OFF</h4>
            <p className="text-xs text-gray-500">Use code WELCOME50 on first order</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm">30-MIN DELIVERY</h4>
            <p className="text-xs text-gray-500">Live GPS tracking on every order</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm">GOURMET CHEF PICKS</h4>
            <p className="text-xs text-gray-500">Hygiene audited kitchens</p>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Main Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
            <span>Restaurants with Online Delivery</span>
            <span className="text-xs bg-orange-100 text-orange-700 font-extrabold px-2.5 py-0.5 rounded-full">
              {displayedRestaurants.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Top-rated spots ready to take your order</p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-2xl text-center max-w-xl mx-auto my-12">
          <p className="font-bold mb-2">{error}</p>
          <button
            onClick={fetchRestaurants}
            className="mt-3 bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : displayedRestaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">No restaurants found</h3>
          <p className="text-gray-500 text-sm mb-6">
            We couldn't find any match for your search criteria. Try modifying your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:bg-orange-600 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
