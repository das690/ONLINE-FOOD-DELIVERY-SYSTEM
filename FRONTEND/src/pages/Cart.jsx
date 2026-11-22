import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  addToCart,
  removeFromCart,
  deleteItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  setTip,
  setDeliveryPreferences
} from '../redux/cartSlice';
import { addToast } from '../redux/uiSlice';
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
  FileText,
  HeartHandshake,
  Leaf,
  BellOff,
  DoorClosed
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
    tip,
    deliveryPreferences,
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
      dispatch(addToast({ message: `Coupon ${code} applied! Saved ₹${response.data.discountAmount || discount}`, type: 'success' }));
      setCouponInput('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    dispatch(addToast({ message: 'Coupon removed', type: 'info' }));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout', { state: { specialInstructions } });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-brand-50 text-brand-500 mx-auto flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2">Your cart is empty</h2>
        <p className="text-surface-500 text-xs sm:text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Good food is always cooking! Add mouth-watering dishes from your favorite local kitchens to satisfy your hunger.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/25 transition active:scale-95 touch-target"
        >
          <span>Explore Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-surface-200/80 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">Your Cart</h1>
          <p className="text-xs text-surface-500 mt-1 font-medium">
            Ordering delicious food from <strong className="text-brand-600 font-bold">{restaurantName || 'Restaurant'}</strong>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {restaurantId && (
            <Link
              to={`/restaurant/${restaurantId}`}
              className="text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition touch-target"
            >
              + Add dishes
            </Link>
          )}
          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 touch-target"
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
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80 divide-y divide-surface-100">
            {items.map((item) => (
              <div key={item._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 ${
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
                    <h4 className="text-xs sm:text-sm font-extrabold text-surface-900 truncate">{item.name}</h4>
                    <p className="text-xs font-black text-surface-900 mt-0.5">₹{item.price}</p>
                  </div>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center space-x-1.5 bg-surface-50 border border-surface-200 rounded-xl px-2 py-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="w-6 h-6 flex items-center justify-center text-surface-600 hover:text-brand-600 font-black active:scale-90 transition touch-target"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-black text-surface-900 px-1 min-w-[14px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(addToCart({ item, restaurantId, restaurantName }))}
                    className="w-6 h-6 flex items-center justify-center text-surface-600 hover:text-brand-600 font-black active:scale-90 transition touch-target"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                  <span className="text-xs sm:text-sm font-black text-surface-900 w-16 text-right">
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(deleteItem(item._id))}
                    className="text-surface-300 hover:text-rose-500 transition p-1.5 touch-target"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cooking Instructions Input */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80">
            <label className="text-xs font-black text-surface-700 flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-brand-500" />
              <span>Special Cooking Instructions</span>
            </label>
            <textarea
              rows="2"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please make it less spicy, do not ring the doorbell, extra mint chutney..."
              className="w-full text-xs sm:text-sm p-3.5 border border-surface-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 font-medium bg-surface-50"
            ></textarea>
          </div>

          {/* Tip Your Delivery Partner Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-surface-900 flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-brand-500" />
                <span>Tip Your Delivery Partner</span>
              </h3>
              {tip > 0 && (
                <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">
                  ₹{tip} added
                </span>
              )}
            </div>
            <p className="text-xs text-surface-500 mb-4 font-medium">
              100% of your tip goes directly to your delivery hero who braves weather and traffic.
            </p>

            <div className="grid grid-cols-5 gap-2">
              {[0, 20, 30, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => dispatch(setTip(amt))}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all ${
                    tip === amt
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500/30'
                      : 'bg-surface-50 hover:bg-surface-100 text-surface-700 border border-surface-200'
                  }`}
                >
                  {amt === 0 ? 'None' : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery & Eco Preferences */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80 space-y-3">
            <h3 className="text-sm font-black text-surface-900 flex items-center space-x-2 mb-2">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span>Delivery & Eco Preferences</span>
            </h3>

            <label className="flex items-start space-x-3 p-3 rounded-2xl bg-surface-50/70 border border-surface-200/80 cursor-pointer hover:bg-surface-100 transition">
              <input
                type="checkbox"
                checked={deliveryPreferences?.noCutlery || false}
                onChange={(e) => dispatch(setDeliveryPreferences({ noCutlery: e.target.checked }))}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <p className="font-bold text-surface-900 flex items-center space-x-1">
                  <span>Don't send plastic cutlery 🌱</span>
                </p>
                <p className="text-surface-500 text-[11px] mt-0.5">Thank you for helping us reduce disposable plastic waste!</p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded-2xl bg-surface-50/70 border border-surface-200/80 cursor-pointer hover:bg-surface-100 transition">
              <input
                type="checkbox"
                checked={deliveryPreferences?.contactless || false}
                onChange={(e) => dispatch(setDeliveryPreferences({ contactless: e.target.checked }))}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="text-xs">
                <p className="font-bold text-surface-900 flex items-center space-x-1">
                  <DoorClosed className="w-3.5 h-3.5 text-brand-500" />
                  <span>Contactless Doorstep Delivery</span>
                </p>
                <p className="text-surface-500 text-[11px] mt-0.5">Rider will leave package at door and send delivery confirmation.</p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded-2xl bg-surface-50/70 border border-surface-200/80 cursor-pointer hover:bg-surface-100 transition">
              <input
                type="checkbox"
                checked={deliveryPreferences?.dontRingBell || false}
                onChange={(e) => dispatch(setDeliveryPreferences({ dontRingBell: e.target.checked }))}
                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <p className="font-bold text-surface-900 flex items-center space-x-1">
                  <BellOff className="w-3.5 h-3.5 text-purple-500" />
                  <span>Avoid ringing the doorbell / knock gently</span>
                </p>
                <p className="text-surface-500 text-[11px] mt-0.5">Helpful if working from home, pets barking, or baby sleeping.</p>
              </div>
            </label>
          </div>

          {/* Coupons Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80">
            <h3 className="text-sm font-black text-surface-900 flex items-center space-x-2 mb-4">
              <Percent className="w-4 h-4 text-brand-500" />
              <span>Coupons & Secret Offers</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center space-x-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied! You saved ₹{discount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-rose-600 font-black hover:underline touch-target"
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
                    className="flex-1 py-2.5 px-3.5 border border-surface-200 rounded-xl text-xs sm:text-sm font-black uppercase outline-none focus:ring-2 focus:ring-brand-500 bg-surface-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="bg-surface-900 text-white font-black text-xs px-5 rounded-xl hover:bg-black transition active:scale-95 touch-target"
                  >
                    Apply
                  </button>
                </div>

                {couponError && <p className="text-xs text-rose-600 font-bold">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-emerald-600 font-bold">{couponSuccess}</p>}

                {/* Available Coupon Pills */}
                {availableCoupons.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-black text-surface-400 uppercase tracking-wider">
                      Available Offers:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {availableCoupons.map((c) => (
                        <div
                          key={c.code}
                          className="p-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 flex justify-between items-center"
                        >
                          <div>
                            <span className="text-xs font-black text-brand-700 uppercase">
                              {c.code}
                            </span>
                            <p className="text-[10px] text-surface-500 line-clamp-1">{c.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-xs font-black text-brand-600 hover:text-brand-700 px-3 py-1 bg-white rounded-lg shadow-xs touch-target"
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
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80 sticky top-24">
            <h3 className="text-base font-black text-surface-900 mb-4 pb-3 border-b border-surface-100">
              Bill Details
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-surface-600">
              <div className="flex justify-between items-center">
                <span>Item Total</span>
                <span className="font-extrabold text-surface-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1.5">
                  <span>Delivery Partner Fee</span>
                  {deliveryFee === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-extrabold text-surface-900">
                  {deliveryFee === 0 ? '₹0' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Taxes & Charges (5% GST)</span>
                <span className="font-extrabold text-surface-900">₹{tax}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              {tip > 0 && (
                <div className="flex justify-between items-center text-brand-600 font-bold">
                  <span>Delivery Partner Tip</span>
                  <span>+ ₹{tip}</span>
                </div>
              )}

              <div className="pt-4 border-t border-surface-100 flex justify-between items-center text-base sm:text-lg font-black text-surface-900">
                <span>To Pay</span>
                <span className="text-brand-600 text-xl font-black">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full mt-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition flex items-center justify-center space-x-2 active:scale-95 touch-target"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-surface-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe and 100% encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
