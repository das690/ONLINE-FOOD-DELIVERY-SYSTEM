import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resolveConflictAndAdd, dismissConflict } from '../redux/cartSlice';
import { AlertCircle, ArrowRight, UtensilsCrossed } from 'lucide-react';

const RestaurantConflictModal = () => {
  const dispatch = useDispatch();
  const { conflictPending, restaurantName } = useSelector((state) => state.cart);

  if (!conflictPending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-surface-200 transform transition-all animate-scaleIn">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-surface-900 leading-tight">
              Replace cart dishes?
            </h3>
            <span className="text-xs text-surface-400 font-medium">Single Restaurant Ordering Policy</span>
          </div>
        </div>

        <p className="text-surface-600 text-xs sm:text-sm leading-relaxed mb-6">
          Your cart currently holds delicacies from <strong className="text-surface-900">{restaurantName || 'another kitchen'}</strong>. Would you like to clear those and start fresh with items from <strong className="text-brand-600 font-bold">{conflictPending.restaurantName || 'this kitchen'}</strong>?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => dispatch(dismissConflict())}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-surface-200 font-bold text-surface-700 hover:bg-surface-50 transition active:scale-95 text-xs sm:text-sm touch-target"
          >
            Keep Existing Cart
          </button>
          <button
            type="button"
            onClick={() => dispatch(resolveConflictAndAdd())}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 font-black text-white transition flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 active:scale-95 text-xs sm:text-sm touch-target"
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
