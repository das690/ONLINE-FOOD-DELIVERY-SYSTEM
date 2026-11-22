import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return saved;
    }
    // Check OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      return 'dark';
    }
  } catch (e) {
    // Ignore fallback
  }
  document.documentElement.classList.remove('dark');
  return 'light';
};

const initialTheme = getInitialTheme();

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme, // 'light' | 'dark'
  },
  reducers: {
    toggleTheme: (state) => {
      const nextMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = nextMode;
      try {
        localStorage.setItem('theme', nextMode);
        if (nextMode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        // Ignore
      }
    },
    setTheme: (state, action) => {
      const nextMode = action.payload;
      state.mode = nextMode;
      try {
        localStorage.setItem('theme', nextMode);
        if (nextMode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        // Ignore
      }
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
