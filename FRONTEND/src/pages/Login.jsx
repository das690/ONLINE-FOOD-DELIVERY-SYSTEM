// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Hit the login endpoint on your backend
      const response = await api.post('/auth/login', formData);
      
      // Update global Redux state with token and user info
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      
      navigate('/'); // Send them to the home page
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            onChange={handleChange} 
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" 
            required 
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            name="password" 
            onChange={handleChange} 
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" 
            required 
          />
        </div>
        
        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 rounded hover:bg-orange-600 transition">
          Login
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        Don't have an account? <Link to="/register" className="text-orange-500 font-bold hover:underline">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;