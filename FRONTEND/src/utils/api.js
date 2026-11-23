import axios from 'axios';

// Normalize baseURL so that /api is always present whether or not VITE_API_URL includes it
const rawBaseURL = import.meta.env.VITE_API_URL || 'https://online-food-delivery-system-i0ik.onrender.com';
const cleanBaseURL = rawBaseURL.replace(/\/+$/, '');
const baseURL = cleanBaseURL.endsWith('/api') ? cleanBaseURL : `${cleanBaseURL}/api`;

const api = axios.create({
  baseURL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        console.warn('Session expired or unauthorized. Logging out.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let the application state handle redirection
      }
    }
    return Promise.reject(error);
  }
);

export default api;
