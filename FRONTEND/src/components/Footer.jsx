import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-20 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Food<span className="text-orange-500">Express</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Discover top-rated restaurants, handcrafted gourmet meals, and superfast contactless delivery in minutes. Designed and developed with modern MERN architecture.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Safe & Verified</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>24/7 Delivery Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition">About Us</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition">Team & Careers</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition">Partner with Us</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition">Ride with Us</Link></li>
            </ul>
          </div>

          {/* Top Cuisines */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Top Cuisines</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-orange-400 cursor-pointer transition">Hyderabadi Biryani</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Wood-Fired Pizza</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Punjabi Dhaba</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">South Indian Tiffin</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Artisanal Desserts</span></li>
            </ul>
          </div>

          {/* Available Cities */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">We Deliver To</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-orange-400 cursor-pointer transition">Bangalore</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Delhi NCR</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Mumbai</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Kolkata</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Chennai</span></li>
              <li><span className="hover:text-orange-400 cursor-pointer transition">Hyderabad</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FoodExpress Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

