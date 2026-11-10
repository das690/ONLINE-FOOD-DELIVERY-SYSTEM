import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;
const tokenFromStorage = localStorage.getItem('token') || null;

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  isAuthenticated: !!tokenFromStorage,
  favorites: [],
  savedAddresses: userFromStorage?.savedAddresses || [],
  selectedCity: localStorage.getItem('selectedCity') || 'Bangalore',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.savedAddresses = action.payload.user?.savedAddresses || [];
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.favorites = [];
      state.savedAddresses = [];
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setSavedAddresses: (state, action) => {
      state.savedAddresses = action.payload;
      if (state.user) {
        state.user.savedAddresses = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    toggleFavoriteLocal: (state, action) => {
      const restId = action.payload;
      const index = state.favorites.indexOf(restId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(restId);
      }
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
      localStorage.setItem('selectedCity', action.payload);
    }
  },
});

export const {
  loginSuccess,
  logout,
  updateUserProfile,
  setSavedAddresses,
  setFavorites,
  toggleFavoriteLocal,
  setSelectedCity
} = authSlice.actions;

export default authSlice.reducer;
