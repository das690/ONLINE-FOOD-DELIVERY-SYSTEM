import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';

const MobileBottomNav = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/cart', label: 'Cart', icon: ShoppingBag, badge: totalItemCount },
    {
      to: isAuthenticated ? '/dashboard' : '/login',
      label: isAuthenticated ? 'Profile' : 'Sign In',
      icon: User
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-surface-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-4 items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all duration-200 relative group touch-target ${
                  isActive
                    ? 'text-brand-600 font-bold scale-105'
                    : 'text-surface-500 hover:text-surface-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'stroke-[2.5px] scale-110 text-brand-600' : 'stroke-[1.8px]'
                      }`}
                    />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-brand-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium tracking-tight mt-1 leading-none">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1 transition-all"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
