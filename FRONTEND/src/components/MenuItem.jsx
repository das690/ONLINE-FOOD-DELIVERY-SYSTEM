import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../redux/cartSlice';
import { Star, Plus, Minus, Sparkles } from 'lucide-react';

const MenuItem = ({ item, restaurantId, restaurantName }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const cartItem = items.find((i) => i._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const defaultFoodImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

  const handleAdd = () => {
    dispatch(addToCart({ item, restaurantId, restaurantName }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item._id));
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-surface-200/80 flex justify-between gap-4 hover:shadow-md hover:border-brand-200 transition-all duration-200">
      {/* Left Column: Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Veg / Non-Veg & Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Standard Square veg/non-veg icon */}
            <span
              className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              ></span>
            </span>

            {item.isBestseller && (
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                <span>Bestseller</span>
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-extrabold text-surface-900 leading-snug line-clamp-2">
            {item.name}
          </h4>
          <p className="text-sm font-black text-surface-900 mt-1">₹{item.price}</p>

          {item.description && (
            <p className="text-xs text-surface-500 mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {item.nutritionalInfo && (
          <p className="text-[11px] text-surface-400 font-medium mt-2.5 truncate">
            🌱 {item.nutritionalInfo}
          </p>
        )}
      </div>

      {/* Right Column: Image & Add Button */}
      <div className="relative flex flex-col items-center flex-shrink-0 w-28 sm:w-36">
        <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-2xl overflow-hidden bg-surface-100 shadow-inner">
          <img
            src={item.image || defaultFoodImg}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-108 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Add Button or Stepper Button */}
        <div className="absolute -bottom-2.5">
          {quantity > 0 ? (
            <div className="flex items-center space-x-2 bg-white text-brand-600 font-black border-2 border-brand-500 rounded-xl px-2 py-1 shadow-md">
              <button
                type="button"
                onClick={handleRemove}
                className="w-7 h-7 flex items-center justify-center hover:bg-brand-50 rounded-lg text-brand-600 active:scale-90 transition touch-target"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="text-xs sm:text-sm px-1 font-black min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleAdd}
                className="w-7 h-7 flex items-center justify-center hover:bg-brand-50 rounded-lg text-brand-600 active:scale-90 transition touch-target"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="bg-white text-brand-600 hover:bg-brand-500 hover:text-white font-black text-xs sm:text-sm px-5 sm:px-6 py-2 rounded-xl border-2 border-brand-500 shadow-md transition-all duration-200 active:scale-95 touch-target min-h-[38px]"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
