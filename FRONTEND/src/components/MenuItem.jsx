import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../redux/cartSlice';
import { Star, Plus, Minus } from 'lucide-react';

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
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex justify-between gap-4 hover:shadow-md transition">
      {/* Left Column: Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Veg / Non-Veg & Badges */}
          <div className="flex items-center space-x-2 mb-2">
            {/* Square veg/non-veg icon */}
            <span
              className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              ></span>
            </span>

            {item.isBestseller && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                <span>Bestseller</span>
              </span>
            )}
          </div>

          <h4 className="text-base font-bold text-gray-900 leading-snug">{item.name}</h4>
          <p className="text-sm font-extrabold text-gray-900 mt-1">₹{item.price}</p>

          {item.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {item.nutritionalInfo && (
          <p className="text-[11px] text-gray-400 font-medium mt-3">
            🌱 {item.nutritionalInfo}
          </p>
        )}
      </div>

      {/* Right Column: Image & Add Button */}
      <div className="relative flex flex-col items-center flex-shrink-0 w-28 sm:w-36">
        <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
          <img
            src={item.image || defaultFoodImg}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Add Button or Stepper Button */}
        <div className="absolute -bottom-2">
          {quantity > 0 ? (
            <div className="flex items-center space-x-2 bg-white text-orange-600 font-bold border-2 border-orange-500 rounded-xl px-2 py-1 shadow-md">
              <button
                onClick={handleRemove}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-50 rounded text-orange-600 active:scale-90 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm px-1 font-extrabold">{quantity}</span>
              <button
                onClick={handleAdd}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-50 rounded text-orange-600 active:scale-90 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-white text-orange-600 hover:bg-orange-500 hover:text-white font-extrabold text-xs sm:text-sm px-6 py-2 rounded-xl border-2 border-orange-500 shadow-md transition active:scale-95"
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
