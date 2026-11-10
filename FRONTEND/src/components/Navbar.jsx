import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setSelectedCity } from '../redux/authSlice';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  Percent,
  ShoppingBag,
  User,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Hyderabad'];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, selectedCity } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleCitySelect = (city) => {
    dispatch(setSelectedCity(city));
    setIsCityDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & Location Picker */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-orange-600 transition">
                    Food<span className="text-orange-500">Express</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-gray-400 -mt-1">
                    Lightning Delivery
                  </span>
                </div>
              </Link>

              {/* Location Picker Pill */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-bold text-gray-900">{selectedCity}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                    <p className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Select Location
                    </p>
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-orange-50 hover:text-orange-600 flex items-center justify-between transition ${
                          selectedCity === city ? 'text-orange-600 bg-orange-50/60 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Navigation Links & Actions */}
            <nav className="hidden md:flex items-center space-x-7">
              <Link
                to="/"
                className="text-sm font-semibold text-gray-700 hover:text-orange-600 flex items-center space-x-1.5 transition"
              >
                <span>Restaurants</span>
              </Link>

              {/* Favorites link */}
              {isAuthenticated && (
                <Link
                  to="/favorites"
                  className="text-sm font-semibold text-gray-700 hover:text-rose-600 flex items-center space-x-1.5 transition"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Favorites</span>
                </Link>
              )}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative flex items-center space-x-2 py-2 px-4 rounded-xl bg-orange-50 hover:bg-orange-100/80 text-orange-600 font-bold text-sm transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart</span>
                {totalItemCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-extrabold shadow-sm animate-pulse">
                    {totalItemCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown or Sign In */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 border border-gray-200 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-gray-800 max-w-[100px] truncate">
                      {user?.name || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 pr-1" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {user?.role === 'restaurant_owner' ? 'Owner' : user?.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        <span>Dashboard & Orders</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span>Saved Favorites</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-bold text-gray-700 hover:text-orange-600 px-3 py-2 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md shadow-orange-500/25 transition active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center space-x-3">
              <Link to="/cart" className="relative p-2 text-gray-700">
                <ShoppingBag className="w-6 h-6 text-orange-500" />
                {totalItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-orange-500"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">Location:</span>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1 bg-gray-50"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700 hover:text-orange-500 py-1"
            >
              Restaurants
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-gray-700 hover:text-orange-500 py-1"
                >
                  Dashboard & Orders
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-gray-700 hover:text-rose-500 py-1"
                >
                  Favorites
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-sm font-semibold text-rose-600 py-1"
                >
                  Sign Out ({user?.name})
                </button>
              </>
            ) : (
              <div className="flex space-x-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-bold border border-orange-500 text-orange-500 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-bold bg-orange-500 text-white rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
