import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setSelectedCity } from '../redux/authSlice';
import {
  UtensilsCrossed,
  MapPin,
  ShoppingBag,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';

const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Hyderabad'];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user, selectedCity } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cityDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setIsCityDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsCityDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleCitySelect = (city) => {
    dispatch(setSelectedCity(city));
    setIsCityDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-surface-200/80 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & Location Picker */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group touch-target">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 group-hover:shadow-glow-brand transition-all duration-300">
                  <UtensilsCrossed className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-surface-900 group-hover:text-brand-600 transition-colors">
                    Food<span className="text-brand-500">Express</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-extrabold text-surface-400 -mt-1 flex items-center space-x-1">
                    <span>Lightning Delivery</span>
                    <span className="w-1 h-1 rounded-full bg-brand-500 animate-ping"></span>
                  </span>
                </div>
              </Link>

              {/* Desktop Location Picker Pill */}
              <div className="relative hidden sm:block" ref={cityDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center space-x-2 py-2 px-3.5 rounded-full bg-surface-100 hover:bg-surface-200/70 border border-surface-200 text-surface-700 text-xs font-semibold transition active:scale-95"
                  aria-expanded={isCityDropdownOpen}
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span className="font-bold text-surface-900">{selectedCity}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-surface-200/90 py-2 z-50 animate-scaleIn">
                    <div className="px-3 py-1.5 border-b border-surface-100 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-surface-400 uppercase tracking-wider">
                        Delivery City
                      </span>
                      <Sparkles className="w-3 h-3 text-brand-500" />
                    </div>
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-brand-50 hover:text-brand-600 flex items-center justify-between transition ${
                          selectedCity === city
                            ? 'text-brand-600 bg-brand-50/70 font-bold'
                            : 'text-surface-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className={`w-3 h-3 ${selectedCity === city ? 'text-brand-500' : 'text-surface-400'}`} />
                          <span>{city}</span>
                        </div>
                        {selectedCity === city && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shadow-xs"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Desktop Navigation Links & Actions */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-sm font-semibold text-surface-700 hover:text-brand-600 transition flex items-center space-x-1 py-1"
              >
                <span>Restaurants</span>
              </Link>

              {/* Favorites link */}
              {isAuthenticated && (
                <Link
                  to="/favorites"
                  className="text-sm font-semibold text-surface-700 hover:text-rose-600 transition flex items-center space-x-1.5 py-1 group"
                >
                  <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span>Favorites</span>
                </Link>
              )}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100/90 text-brand-600 font-bold text-sm transition-all duration-200 border border-brand-200/50 hover:shadow-sm active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                <span>Cart</span>
                {totalItemCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-black shadow-sm animate-pulse">
                    {totalItemCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown or Sign In */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pl-2 pr-3 rounded-full hover:bg-surface-100 border border-surface-200 transition active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold text-surface-800 max-w-[110px] truncate">
                      {user?.name || 'Account'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-surface-200 py-2 z-50 animate-scaleIn">
                      <div className="px-4 py-2.5 border-b border-surface-100">
                        <p className="text-xs font-extrabold text-surface-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-surface-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                          {user?.role === 'restaurant_owner' ? 'Store Partner' : user?.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-surface-700 hover:bg-brand-50 hover:text-brand-600 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-surface-400" />
                        <span>Dashboard & Orders</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-surface-700 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Heart className="w-4 h-4 text-surface-400" />
                        <span>Saved Favorites</span>
                      </Link>

                      <div className="border-t border-surface-100 my-1"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
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
                    className="text-sm font-bold text-surface-700 hover:text-brand-600 px-3 py-2 transition rounded-xl"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm px-4.5 py-2.5 rounded-xl shadow-md shadow-brand-500/25 transition active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Actions: Cart + Hamburger Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition touch-target"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                {totalItemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">
                    {totalItemCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 text-surface-700 hover:text-brand-600 hover:bg-surface-100 rounded-xl transition touch-target"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200/90 bg-white/95 backdrop-blur-2xl px-5 pt-4 pb-8 space-y-4 animate-slideDown shadow-2xl">
            {/* City Selector on Mobile */}
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-black text-surface-600 uppercase tracking-wider">
                  Location:
                </span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="text-xs font-extrabold border border-surface-200 rounded-xl px-3 py-1.5 bg-surface-50 text-surface-900 outline-none focus:ring-2 focus:ring-brand-500"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 text-sm font-bold text-surface-800 hover:text-brand-600"
            >
              <span>Explore Restaurants</span>
              <span className="text-xs text-brand-500 font-semibold">Browse ➔</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-sm font-bold text-surface-800 hover:text-brand-600"
                >
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4 text-surface-400" />
                    <span>Dashboard & My Orders</span>
                  </div>
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-sm font-bold text-surface-800 hover:text-rose-600"
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Saved Favorites</span>
                  </div>
                </Link>

                <div className="pt-2 border-t border-surface-100">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-surface-500">Signed in as <strong>{user?.name}</strong></span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-extrabold border border-brand-500 text-brand-600 rounded-xl hover:bg-brand-50 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-extrabold bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/25 hover:bg-brand-600 transition"
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
