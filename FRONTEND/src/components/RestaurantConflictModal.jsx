import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resolveConflictAndAdd, dismissConflict } from '../redux/cartSlice';
import { AlertCircle, Trash2, ArrowRight } from 'lucide-react';

const RestaurantConflictModal = () => {
  const dispatch = useDispatch();
  const { conflictPending, restaurantName } = useSelector((state) => state.cart);

  if (!conflictPending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all">
        <div className="flex items-center space-x-3 text-orange-600 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Replace cart items?</h3>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Your cart contains dishes from <strong className="text-gray-900">{restaurantName || 'another restaurant'}</strong>. Do you want to discard your selection and start fresh with items from <strong className="text-orange-600">{conflictPending.restaurantName || 'this restaurant'}</strong>?
        </p>

        <div className="flex space-x-3">
          <button
            onClick={() => dispatch(dismissConflict())}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => dispatch(resolveConflictAndAdd())}
            className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold text-white transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 active:scale-95"
          >
            <span>Discard & Add</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantConflictModal;

