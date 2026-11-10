// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Hit the register endpoint on your backend
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input 
            type="text" 
            name="name" 
            onChange={handleChange} 
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" 
            required 
          />
        </div>
        
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
        
        <div>
          <label className="block text-gray-700 mb-1">Account Type</label>
          <select 
            name="role" 
            onChange={handleChange} 
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="customer">Customer</option>
            <option value="restaurant_owner">Restaurant Owner</option>
          </select>
        </div>
        
        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 rounded hover:bg-orange-600 transition">
          Sign Up
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        Already have an account? <Link to="/login" className="text-orange-500 font-bold hover:underline">Login here</Link>
      </p>
    </div>
  );
};

export default Register;