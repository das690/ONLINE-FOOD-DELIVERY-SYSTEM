import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetTokenInfo, setResetTokenInfo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Reset link sent to your email.');
      if (response.data.resetToken) {
        setResetTokenInfo(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 sm:my-16 px-4 pb-28">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-200/80">
        <Link
          to="/login"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-surface-500 hover:text-brand-600 mb-6 transition touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <h2 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight mb-2">Reset Password</h2>
        <p className="text-xs sm:text-sm text-surface-500 mb-6 font-medium">
          Enter your registered email address and we will dispatch a secure password reset link.
        </p>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
            {resetTokenInfo && (
              <div className="pt-2 border-t border-emerald-200">
                <p className="text-[11px] text-surface-600">Quick Test Link (Local dev):</p>
                <Link
                  to={`/reset-password/${resetTokenInfo}`}
                  className="font-black text-brand-600 underline"
                >
                  Click here to set new password ➔
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-surface-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-500/25 transition touch-target"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
