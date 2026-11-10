import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto my-24 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-6 shadow-md shadow-orange-500/10">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-extrabold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-xs text-gray-500 leading-relaxed mb-8">
        We searched all over our kitchens, but couldn't find the page you're looking for. Let's get you back to the feast!
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/25 transition active:scale-95"
      >
        <span>Back to Home</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default NotFound;

