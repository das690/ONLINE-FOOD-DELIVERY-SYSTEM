import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const categories = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80', tag: 'Explore All' },
  { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80', tag: 'Royal Pots' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80', tag: 'Wood-Fired' },
  { name: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80', tag: 'Curries & Naan' },
  { name: 'Burgers', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80', tag: 'Juicy Buns' },
  { name: 'Chinese', image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=300&q=80', tag: 'Wok Tossed' },
  { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&q=80', tag: 'Crispy Dosas' },
  { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=80', tag: 'Sweet Treats' },
  { name: 'Healthy Food', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80', tag: 'Fresh Bowls' }
];

const CategoryBar = ({ activeCategory, onSelectCategory }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-brand-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Flavors</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-surface-900 tracking-tight">
            What's on your mind?
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Swipe through top-rated culinary categories
          </p>
        </div>

        {/* Desktop Carousel Navigation Arrows */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border border-surface-200 bg-white hover:bg-surface-50 shadow-xs flex items-center justify-center text-surface-700 hover:text-brand-600 active:scale-95 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border border-surface-200 bg-white hover:bg-surface-50 shadow-xs flex items-center justify-center text-surface-700 hover:text-brand-600 active:scale-95 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Story Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className="flex-shrink-0 flex flex-col items-center group focus:outline-none snap-start touch-target"
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 transition-all duration-300 transform group-hover:scale-105 ${
                  isActive
                    ? 'ring-4 ring-brand-500 shadow-glow-brand scale-105'
                    : 'border-2 border-transparent hover:border-brand-300/80 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-100 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-brand-600/10 backdrop-blur-[1px]"></div>
                  )}
                </div>
              </div>
              <span
                className={`mt-2.5 text-xs sm:text-sm transition-colors text-center font-bold truncate max-w-[84px] sm:max-w-[96px] ${
                  isActive ? 'text-brand-600 font-extrabold' : 'text-surface-700 group-hover:text-brand-500'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBar;
