import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  addToCart,
  removeFromCart,
  deleteItem,
  clearCart,
  applyCoupon,
  removeCoupon
} from '../redux/cartSlice';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Percent,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  FileText
} from 'lucide-react';
import api from '../utils/api';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items,
    restaurantId,
    restaurantName,
    subtotal,
    deliveryFee,
    tax,
    discount,
    totalAmount,
    appliedCoupon
  } = useSelector((state) => state.cart);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Fetch available coupons from server
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get('/coupons');
        setAvailableCoupons(response.data);
      } catch (err) {
        console.error('Failed to fetch coupons', err);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).toUpperCase().trim();
    if (!code) return;

    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await api.post('/coupons/apply', {
        code,
        orderTotal: subtotal
      });

      dispatch(applyCoupon(response.data));
      setCouponSuccess(response.data.message);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }
    navigate('/checkout', { state: { specialInstructions } });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          Good food is always cooking! Add dishes from your favorite restaurants to satisfy your hunger.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-lg shadow-orange-500/25 transition active:scale-95"
        >
          <span>Explore Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Your Cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            Ordering from <strong className="text-orange-600 font-bold">{restaurantName || 'Restaurant'}</strong>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {restaurantId && (
            <Link
              to={`/restaurant/${restaurantId}`}
              className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition"
            >
              + Add more items
            </Link>
          )}
          <button
            onClick={() => dispatch(clearCart())}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Container */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span
                    className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center flex-shrink-0 ${
                      item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    ></span>
                  </span>

                  <div className="truncate">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-xs font-extrabold text-gray-900">₹{item.price}</p>
                  </div>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-orange-600 font-bold active:scale-90 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-gray-900 px-1">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(addToCart({ item, restaurantId, restaurantName }))}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-orange-600 font-bold active:scale-90 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-sm font-black text-gray-900 w-16 text-right">
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => dispatch(deleteItem(item._id))}
                    className="text-gray-300 hover:text-rose-500 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cooking Instructions Input */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5 mb-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>Special Cooking Instructions</span>
            </label>
            <textarea
              rows="2"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please make it less spicy, do not ring the doorbell, extra mint chutney..."
              className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>

          {/* Coupons Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-2 mb-4">
              <Percent className="w-4 h-4 text-orange-500" />
              <span>Coupons & Offers</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied! You saved ₹{discount}
                  </span>
                </div>
                <button
                  onClick={() => dispatch(removeCoupon())}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    className="bg-gray-900 text-white font-bold text-xs px-4 rounded-xl hover:bg-black transition active:scale-95"
                  >
                    Apply
                  </button>
                </div>

                {couponError && <p className="text-xs text-rose-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}

                {/* Available Coupon Pills */}
                {availableCoupons.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Available Offers:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableCoupons.map((c) => (
                        <div
                          key={c.code}
                          className="p-2.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 flex justify-between items-center"
                        >
                          <div>
                            <span className="text-xs font-black text-orange-700 uppercase">
                              {c.code}
                            </span>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{c.description}</p>
                          </div>
                          <button
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2 py-1 bg-white rounded-lg shadow-xs"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Bill Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Bill Details
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>Item Total</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-bold text-gray-900">
                  {deliveryFee === 0 ? '₹0' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Taxes & Charges (5% GST)</span>
                <span className="font-bold text-gray-900">₹{tax}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-base font-black text-gray-900">
                <span>To Pay</span>
                <span className="text-orange-600 text-lg">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe and secure payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
