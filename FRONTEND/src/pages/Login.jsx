import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import api from '../utils/api';
import { Lock, Mail, Eye, EyeOff, UtensilsCrossed, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const response = await api.post('/auth/login', formData);
      dispatch(loginSuccess(response.data));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/demo-login', { role });
      dispatch(loginSuccess(response.data));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4 pb-28">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-200/80">
        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">Welcome Back!</h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-1 font-medium">Sign in to track orders, addresses & favorites</p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="mb-6 p-4 bg-brand-50/70 rounded-2xl border border-brand-200/70">
          <p className="text-[11px] font-black uppercase tracking-wider text-brand-900 text-center mb-2.5 flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Instant One-Click Demo Access</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-2.5 px-1 text-center bg-white hover:bg-brand-100/80 border border-brand-200 rounded-xl text-xs font-black text-surface-800 shadow-xs active:scale-95 transition touch-target"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('restaurant_owner')}
              className="py-2.5 px-1 text-center bg-white hover:bg-brand-100/80 border border-brand-200 rounded-xl text-xs font-black text-surface-800 shadow-xs active:scale-95 transition touch-target"
            >
              👨‍🍳 Partner
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2.5 px-1 text-center bg-white hover:bg-brand-100/80 border border-brand-200 rounded-xl text-xs font-black text-surface-800 shadow-xs active:scale-95 transition touch-target"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-surface-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-black text-surface-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-black text-brand-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1 touch-target"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-95 touch-target"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-surface-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-black hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
