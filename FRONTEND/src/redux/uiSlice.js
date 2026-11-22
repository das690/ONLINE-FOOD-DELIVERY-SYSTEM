import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: []
  },
  reducers: {
    addToast: (state, action) => {
      const { message, type = 'success', duration = 3000 } = typeof action.payload === 'string'
        ? { message: action.payload }
        : action.payload;
      
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      state.toasts.push({ id, message, type, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    }
  }
});

export const { addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;
