import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, MapPin, Sparkles, Flame, Clock, Award, X, Utensils, Zap, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import CategoryBar from '../components/CategoryBar';
import FilterBar from '../components/FilterBar';

const QUICK_TAGS = ['Biryani', 'Pizza', 'Burger', 'Paneer', 'Chinese', 'Desserts', 'Dosa'];

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
    }, 350);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Showcase Section */}
      <section className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl bg-gradient-to-br from-brand-600 via-amber-600 to-rose-600 p-6 sm:p-10 lg:p-14 text-white">
        {/* Dynamic Background Mesh Accents */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute left-8 -top-12 w-64 h-64 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Location Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-amber-100 mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Delivering across {selectedCity}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-3">
            Craving something <span className="underline decoration-amber-300 decoration-wavy decoration-2">delicious</span>?
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-amber-100 mb-8 font-medium max-w-xl leading-relaxed">
            Order from handcrafted gourmet kitchens, trending street hubs, and artisanal dessert bars near you.
          </p>

          {/* Search Box Capsule */}
          <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center text-surface-800 border border-white/50 focus-within:ring-4 focus-within:ring-brand-400/30 transition-all">
            <div className="pl-3 pr-2 text-brand-500 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for biryani, pizza, rolls, or restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-2 px-2 text-xs sm:text-sm md:text-base outline-none text-surface-900 placeholder-surface-400 font-bold bg-transparent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs text-surface-400 hover:text-surface-700 px-2 font-bold touch-target"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={fetchRestaurants}
              className="bg-brand-500 hover:bg-brand-600 text-white font-black px-4 sm:px-6 py-2.5 rounded-xl transition shadow-md shadow-brand-500/30 active:scale-95 text-xs sm:text-sm shrink-0 touch-target"
            >
              Search
            </button>
          </div>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Popular:</span>
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchTerm(tag)}
                className="text-[11px] font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg backdrop-blur-xs transition active:scale-95 border border-white/15"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Decorative Badges (Desktop) */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 space-y-4 pointer-events-none">
          <div className="glass-dark px-4 py-2.5 rounded-2xl border border-white/20 shadow-xl flex items-center space-x-3 animate-float">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-xs font-black text-white">25-Min Lightning</p>
              <p className="text-[10px] text-amber-300">Fastest delivery guarantee</p>
            </div>
          </div>
          <div className="glass-dark px-4 py-2.5 rounded-2xl border border-white/20 shadow-xl flex items-center space-x-3 animate-float-delayed">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-xs font-black text-white">4.8+ Top Rated</p>
              <p className="text-[10px] text-amber-300">Chef curated spots</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Story Circles */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      {/* Promotional Value Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-200/60 shadow-xs flex items-center space-x-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            %
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600">Promo Code</span>
            <h4 className="font-black text-surface-900 text-sm sm:text-base">UP TO 50% OFF</h4>
            <p className="text-xs text-surface-500 mt-0.5">Apply WELCOME50 on checkout</p>
          </div>
        </div>

        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 shadow-xs flex items-center space-x-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Live GPS</span>
            <h4 className="font-black text-surface-900 text-sm sm:text-base">30-MIN DELIVERY</h4>
            <p className="text-xs text-surface-500 mt-0.5">Real-time driver location radar</p>
          </div>
        </div>

        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/60 shadow-xs flex items-center space-x-4 hover:shadow-md transition">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Verified Kitchens</span>
            <h4 className="font-black text-surface-900 text-sm sm:text-base">GOURMET CHEF PICKS</h4>
            <p className="text-xs text-surface-500 mt-0.5">100% hygiene and safety audited</p>
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
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-surface-900 tracking-tight flex items-center space-x-2.5">
            <span>Restaurants with Online Delivery</span>
            <span className="text-xs bg-brand-100 text-brand-700 font-black px-2.5 py-0.5 rounded-full">
              {displayedRestaurants.length}
            </span>
          </h2>
          <p className="text-xs text-surface-500 mt-0.5">Top-rated spots ready to take your order</p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-xs border border-surface-200 animate-pulse flex flex-col h-80">
              <div className="h-48 bg-surface-200"></div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-surface-200 rounded-lg w-3/4"></div>
                  <div className="h-3 bg-surface-200 rounded-lg w-1/2"></div>
                </div>
                <div className="h-3 bg-surface-200 rounded-lg w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-3xl text-center max-w-xl mx-auto my-12 shadow-sm">
          <p className="font-bold mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchRestaurants}
            className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-700 transition shadow-md touch-target"
          >
            Retry Connection
          </button>
        </div>
      ) : displayedRestaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 shadow-xs max-w-lg mx-auto p-8">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-500 mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-surface-900 mb-1">No restaurants found</h3>
          <p className="text-surface-500 text-xs sm:text-sm mb-6 leading-relaxed">
            We couldn't find any match for your search criteria in {selectedCity}. Try modifying or clearing your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="bg-brand-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-brand-500/25 hover:bg-brand-600 transition touch-target"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {displayedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
