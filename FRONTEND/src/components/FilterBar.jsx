import React from 'react';
import { Star, Zap, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';

const FilterBar = ({ filters, setFilters, onReset }) => {
  const isAnyFilterActive =
    filters.vegOnly ||
    filters.fastDelivery ||
    filters.minRating > 0 ||
    filters.sort !== 'relevance';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-5 border-b border-surface-200/80">
      {/* Scrollable Filter Pills on Mobile */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-black text-surface-500 uppercase tracking-wider pr-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Pure Veg Pill */}
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, vegOnly: !prev.vegOnly }))}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200 shrink-0 touch-target ${
            filters.vegOnly
              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
              : 'border-surface-200 text-surface-700 hover:border-surface-300 bg-white'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shrink-0"></span>
          <span>Pure Veg</span>
        </button>

        {/* Rating 4.0+ Pill */}
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === 4 ? 0 : 4 }))}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200 shrink-0 touch-target ${
            filters.minRating === 4
              ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
              : 'border-surface-200 text-surface-700 hover:border-surface-300 bg-white'
          }`}
        >
          <Star className={`w-3.5 h-3.5 shrink-0 ${filters.minRating === 4 ? 'fill-amber-500 text-amber-500' : 'text-surface-400'}`} />
          <span>Ratings 4.0+</span>
        </button>

        {/* Fast Delivery Pill (<25 min) */}
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200 shrink-0 touch-target ${
            filters.fastDelivery
              ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-xs ring-2 ring-brand-500/20'
              : 'border-surface-200 text-surface-700 hover:border-surface-300 bg-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span>Fast Delivery (⚡)</span>
        </button>

        {/* Clear Filter Button */}
        {isAnyFilterActive && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-full transition shrink-0 touch-target"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0">
        <span className="text-xs font-bold text-surface-400 sm:hidden">Sort options:</span>
        <div className="relative inline-block w-full sm:w-auto">
          <div className="flex items-center space-x-2 bg-white border border-surface-200 rounded-xl px-3 py-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-surface-400 shrink-0" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              className="text-xs font-bold bg-transparent text-surface-800 outline-none w-full cursor-pointer py-1"
            >
              <option value="relevance">Sort By: Relevance</option>
              <option value="rating_desc">Highest Rated (★ 5.0)</option>
              <option value="delivery_asc">Fastest Delivery Time</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
