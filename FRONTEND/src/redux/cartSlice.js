import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse cart storage', e);
  }
  return null;
};

const savedCart = loadCartFromStorage();

const recalculateTotals = (state) => {
  state.subtotal = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  state.deliveryFee = state.subtotal > 500 || state.subtotal === 0 ? 0 : 40;
  state.tax = Math.round(state.subtotal * 0.05);

  if (state.appliedCoupon) {
    const calcDiscount = Math.min(
      Math.round((state.subtotal * state.appliedCoupon.discountPercent) / 100),
      state.appliedCoupon.maxDiscount || 150
    );
    state.discount = calcDiscount;
  } else {
    state.discount = 0;
  }

  state.totalAmount = Math.max(0, state.subtotal + state.deliveryFee + state.tax - state.discount);

  // Save to localStorage
  try {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      restaurantId: state.restaurantId,
      restaurantName: state.restaurantName,
      appliedCoupon: state.appliedCoupon
    }));
  } catch (e) {
    // Ignore storage errors
  }
};

const initialState = {
  items: savedCart?.items || [],
  restaurantId: savedCart?.restaurantId || null,
  restaurantName: savedCart?.restaurantName || '',
  subtotal: 0,
  deliveryFee: 40,
  tax: 0,
  discount: 0,
  totalAmount: 0,
  appliedCoupon: savedCart?.appliedCoupon || null,
  conflictPending: null, // Holds item details if restaurant mismatch occurs
};

// Initialize totals on first load
recalculateTotals(initialState);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, restaurantId, restaurantName } = action.payload;

      // Check if item is from another restaurant
      if (state.restaurantId && state.restaurantId !== restaurantId && state.items.length > 0) {
        state.conflictPending = { item, restaurantId, restaurantName };
        return;
      }

      state.restaurantId = restaurantId;
      if (restaurantName) state.restaurantName = restaurantName;

      const existingItem = state.items.find(i => i._id === item._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          quantity: 1,
          category: item.category
        });
      }

      recalculateTotals(state);
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const existingItem = state.items.find(i => i._id === itemId);

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.items = state.items.filter(i => i._id !== itemId);
        }
      }

      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
        state.appliedCoupon = null;
      }

      recalculateTotals(state);
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
        state.appliedCoupon = null;
      }
      recalculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = '';
      state.appliedCoupon = null;
      state.conflictPending = null;
      recalculateTotals(state);
      localStorage.removeItem('cart');
    },
    applyCoupon: (state, action) => {
      state.appliedCoupon = action.payload; // { code, discountPercent, maxDiscount, discountAmount }
      recalculateTotals(state);
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      recalculateTotals(state);
    },
    resolveConflictAndAdd: (state) => {
      if (state.conflictPending) {
        const { item, restaurantId, restaurantName } = state.conflictPending;
        state.items = [{
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          quantity: 1,
          category: item.category
        }];
        state.restaurantId = restaurantId;
        state.restaurantName = restaurantName || '';
        state.appliedCoupon = null;
        state.conflictPending = null;
        recalculateTotals(state);
      }
    },
    dismissConflict: (state) => {
      state.conflictPending = null;
    }
  },
});

export const {
  addToCart,
  removeFromCart,
  deleteItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  resolveConflictAndAdd,
  dismissConflict
} = cartSlice.actions;

export default cartSlice.reducer;
