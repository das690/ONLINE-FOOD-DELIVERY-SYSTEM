import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80' },
  { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80' },
  { name: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80' },
  { name: 'Burgers', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80' },
  { name: 'Chinese', image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&q=80' },
  { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&q=80' },
  { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&q=80' },
  { name: 'Healthy Food', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80' }
];

const CategoryBar = ({ activeCategory, onSelectCategory }) => {
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">What's on your mind?</h2>
          <p className="text-sm text-gray-500">Explore curated delicacies and trending cravings</p>
        </div>
        <div className="hidden sm:flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 flex items-center justify-center text-gray-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 flex items-center justify-center text-gray-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="flex-shrink-0 flex flex-col items-center group transition focus:outline-none"
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-1 transition-all duration-300 transform group-hover:scale-105 shadow-md ${
                  isActive
                    ? 'ring-4 ring-orange-500 shadow-orange-500/30'
                    : 'border-2 border-transparent hover:border-orange-300'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-semibold transition ${
                  isActive ? 'text-orange-600 font-bold' : 'text-gray-700 group-hover:text-orange-500'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;

