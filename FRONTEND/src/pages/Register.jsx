import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import api from '../utils/api';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, UtensilsCrossed, ShieldAlert } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
    adminSecret: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4 pb-28">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-200/80">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">Create Account</h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-1 font-medium">Join FoodExpress for culinary happiness delivered fast</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-surface-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-surface-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-surface-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-11 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1 touch-target"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full py-3 px-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="customer">Foodie (Customer)</option>
                <option value="restaurant_owner">Restaurant Partner</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 00000"
                  className="w-full pl-10 pr-3 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Secret Code */}
          {formData.role === 'admin' && (
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
              <label className="block text-xs font-black text-purple-900 mb-1 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <span>Admin Secret Key (GUVI-ADMIN)</span>
              </label>
              <input
                type="password"
                name="adminSecret"
                value={formData.adminSecret}
                onChange={handleChange}
                placeholder="Enter GUVI-ADMIN to verify"
                className="w-full p-2.5 bg-white border border-purple-300 rounded-xl text-xs sm:text-sm font-semibold"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-surface-700 mb-1">Default Delivery Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-surface-400 absolute left-3.5 top-3.5" />
              <textarea
                rows="2"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Flat No., Street, City"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-95 touch-target"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-surface-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 font-black hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
