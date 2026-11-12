import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto my-20 sm:my-28 px-4 text-center pb-28">
      <div className="w-24 h-24 rounded-3xl bg-brand-50 text-brand-500 mx-auto flex items-center justify-center mb-6 shadow-md shadow-brand-500/10 animate-float">
        <UtensilsCrossed className="w-12 h-12" />
      </div>
      <h1 className="text-6xl sm:text-7xl font-black text-surface-900 mb-2 tracking-tight">404</h1>
      <h2 className="text-xl sm:text-2xl font-black text-surface-800 mb-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-surface-500 leading-relaxed mb-8 max-w-sm mx-auto font-medium">
        We searched all across our cloud kitchens, but couldn't find the page you're looking for. Let's get you back to the feast!
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-brand-500/25 transition active:scale-95 touch-target"
      >
        <span>Back to Home</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default NotFound;
