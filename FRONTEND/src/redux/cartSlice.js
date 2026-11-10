// src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  restaurantId: null, // Track which restaurant they are ordering from
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, restaurantId } = action.payload;

      // Ensure user can't order from multiple restaurants simultaneously
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        alert('You can only order from one restaurant at a time. Clear your cart first.');
        return;
      }

      state.restaurantId = restaurantId;
      const existingItem = state.items.find(i => i._id === item._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      // Recalculate total
      state.totalAmount = state.items.reduce((total, i) => total + (i.price * i.quantity), 0);
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const existingItem = state.items.find(i => i._id === itemId);

      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        state.items = state.items.filter(i => i._id !== itemId);
      }

      // Reset restaurant ID if cart is empty
      if (state.items.length === 0) {
        state.restaurantId = null;
      }
      
      // Recalculate total
      state.totalAmount = state.items.reduce((total, i) => total + (i.price * i.quantity), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.totalAmount = 0;
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;