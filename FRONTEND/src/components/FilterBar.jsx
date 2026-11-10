import React from 'react';
import { SlidersHorizontal, Star, Clock, Zap, ArrowUpDown, X } from 'lucide-react';

const FilterBar = ({ filters, setFilters, onReset }) => {
  const isAnyFilterActive =
    filters.vegOnly ||
    filters.fastDelivery ||
    filters.minRating > 0 ||
    filters.sort !== 'relevance';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-2">
        {/* Pure Veg Pill */}
        <button
          onClick={() => setFilters(prev => ({ ...prev, vegOnly: !prev.vegOnly }))}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition ${
            filters.vegOnly
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
              : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Pure Veg</span>
        </button>

        {/* Rating 4.0+ Pill */}
        <button
          onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === 4 ? 0 : 4 }))}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition ${
            filters.minRating === 4
              ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
              : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${filters.minRating === 4 ? 'fill-amber-500 text-amber-500' : 'text-gray-500'}`} />
          <span>Ratings 4.0+</span>
        </button>

        {/* Fast Delivery Pill */}
        <button
          onClick={() => setFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition ${
            filters.fastDelivery
              ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
              : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-orange-500" />
          <span>Fast Delivery</span>
        </button>

        {/* Reset Filter Button */}
        {isAnyFilterActive && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 rounded-full transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center space-x-2">
        <ArrowUpDown className="w-4 h-4 text-gray-500 hidden sm:block" />
        <select
          value={filters.sort}
          onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
          className="text-xs sm:text-sm font-medium border border-gray-300 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="relevance">Sort By: Relevance</option>
          <option value="rating_desc">Rating: High to Low</option>
          <option value="delivery_asc">Delivery Time: Fastest</option>
          <option value="price_asc">Cost: Low to High</option>
          <option value="price_desc">Cost: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;

