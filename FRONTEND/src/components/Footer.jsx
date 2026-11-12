import React, { useState } from 'react';
import { UtensilsCrossed, ShieldCheck, Clock, MapPin, Send, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-surface-950 text-surface-400 mt-20 pt-16 pb-24 md:pb-12 border-t border-surface-800/90 overflow-hidden">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-amber-500 to-rose-600"></div>

      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Newsletter & Offer Card */}
        <div className="bg-gradient-to-r from-surface-900 to-surface-850 rounded-3xl p-6 sm:p-8 border border-surface-800 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get 50% Off First Feast</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Subscribe to FoodExpress Daily Drops
            </h3>
            <p className="text-xs sm:text-sm text-surface-400">
              Secret coupon codes, chef specials & midnight cravings delivered to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            {subscribed ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center space-x-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>You're on the list! Welcome coupon arriving soon.</span>
              </div>
            ) : (
              <div className="flex bg-surface-950/80 border border-surface-700 rounded-2xl p-1.5 focus-within:border-brand-500 transition-colors">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-surface-500 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-brand-500/30 flex items-center space-x-1 active:scale-95 shrink-0"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-surface-800/80">
          {/* Brand Info (2 Columns) */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Food<span className="text-brand-500">Express</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-surface-400 max-w-sm">
              Discover verified gourmet kitchens, trending street flavours, and 25-minute lightning delivery. Designed for foodies, powered by modern MERN stack.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-surface-300 bg-surface-900/90 px-3.5 py-2 rounded-xl border border-surface-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Safe & Audited</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-surface-300 bg-surface-900/90 px-3.5 py-2 rounded-xl border border-surface-800">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Live GPS Tracking</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-brand-400 hover:translate-x-1 inline-block transition">About Us</Link></li>
              <li><Link to="/" className="hover:text-brand-400 hover:translate-x-1 inline-block transition">Partner with Us</Link></li>
              <li><Link to="/" className="hover:text-brand-400 hover:translate-x-1 inline-block transition">Ride & Deliver</Link></li>
              <li><Link to="/" className="hover:text-brand-400 hover:translate-x-1 inline-block transition">Careers</Link></li>
              <li><Link to="/" className="hover:text-brand-400 hover:translate-x-1 inline-block transition">Food Safety Audit</Link></li>
            </ul>
          </div>

          {/* Top Cuisines */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Trending Cuisines</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Hyderabadi Dum Biryani</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Wood-Fired Neapolitan Pizza</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Authentic South Indian Tiffin</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Crispy Smash Burgers</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Artisanal Waffles & Gelato</span></li>
            </ul>
          </div>

          {/* Available Cities */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">We Deliver To</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Bangalore (Silicon Hub)</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Delhi NCR</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Mumbai Metropolitan</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Kolkata</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Chennai</span></li>
              <li><span className="hover:text-brand-400 hover:translate-x-1 inline-block transition cursor-pointer">Hyderabad</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-500 gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} FoodExpress Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-6">
            <span className="hover:text-surface-300 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-surface-300 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-surface-300 cursor-pointer transition">Security & Trust</span>
            <span className="hover:text-surface-300 cursor-pointer transition">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
