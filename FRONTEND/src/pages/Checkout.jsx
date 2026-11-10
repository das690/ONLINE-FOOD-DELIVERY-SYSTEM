import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearCart } from '../redux/cartSlice';
import { setSavedAddresses } from '../redux/authSlice';
import {
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../utils/api';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const specialInstructions = location.state?.specialInstructions || '';

  const { items, restaurantId, restaurantName, subtotal, deliveryFee, tax, discount, totalAmount, appliedCoupon } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  // Address state
  const [savedAddressesList, setSavedAddressesList] = useState(user?.savedAddresses || []);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '',
    phone: user?.phone || ''
  });

  // Payment method: 'razorpay' | 'cod' | 'upi'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch updated user addresses on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.savedAddresses) {
          setSavedAddressesList(response.data.savedAddresses);
          dispatch(setSavedAddresses(response.data.savedAddresses));
        }
      } catch (e) {
        console.error('Failed to load addresses', e);
      }
    };
    fetchProfile();
  }, [dispatch]);

  // Handle adding new address
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city) {
      alert('Please fill in street and city');
      return;
    }

    try {
      const response = await api.post('/auth/address', newAddress);
      setSavedAddressesList(response.data);
      dispatch(setSavedAddresses(response.data));
      setSelectedAddressIndex(response.data.length - 1);
      setShowNewAddressForm(false);
    } catch (err) {
      alert('Failed to save address');
    }
  };

  // Main payment & order handler
  const handlePlaceOrder = async () => {
    setError('');

    // Determine delivery address
    let activeAddress = null;
    if (savedAddressesList.length > 0 && selectedAddressIndex >= 0) {
      activeAddress = savedAddressesList[selectedAddressIndex];
    } else if (newAddress.street) {
      activeAddress = newAddress;
    } else {
      setError('Please add or select a delivery address');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order in MongoDB (Backend recalculates prices securely)
      const orderPayload = {
        restaurantId,
        items: items.map(i => ({
          _id: i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          isVeg: i.isVeg,
          image: i.image
        })),
        deliveryAddress: activeAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code || '',
        specialInstructions
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data;

      // 2. Process Payment based on method
      if (paymentMethod === 'cod') {
        // Cash on delivery: complete immediately!
        triggerCelebration();
        dispatch(clearCart());
        navigate(`/track/${createdOrder._id}`);
        return;
      }

      if (paymentMethod === 'upi') {
        // Simulated instant UPI
        await api.post('/payments/verify', {
          orderId: createdOrder._id,
          isSimulated: true,
          razorpay_payment_id: `pay_upi_${Date.now()}`
        });

        triggerCelebration();
        dispatch(clearCart());
        navigate(`/track/${createdOrder._id}`);
        return;
      }

      // Razorpay Online Flow
      try {
        const paymentRes = await api.post('/payments/create-order', {
          orderId: createdOrder._id
        });

        const { order: rzpOrder, key, isSimulated } = paymentRes.data;

        // If backend simulated mode or Razorpay script unavailable
        if (isSimulated || typeof window.Razorpay === 'undefined') {
          await api.post('/payments/verify', {
            orderId: createdOrder._id,
            isSimulated: true,
            razorpay_payment_id: `pay_test_${Date.now()}`
          });

          triggerCelebration();
          dispatch(clearCart());
          navigate(`/track/${createdOrder._id}`);
          return;
        }

        // Launch Razorpay Checkout Pop-up
        const options = {
          key: key || 'rzp_test_TvD1fU6ZsxKH8f',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'FoodExpress Delivery',
          description: `Order from ${restaurantName || 'Restaurant'}`,
          order_id: rzpOrder.id,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#f97316'
          },
          handler: async function (response) {
            try {
              await api.post('/payments/verify', {
                orderId: createdOrder._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              triggerCelebration();
              dispatch(clearCart());
              navigate(`/track/${createdOrder._id}`);
            } catch (vErr) {
              setError('Payment verification failed on server.');
            }
          }
        };

        const rzpWindow = new window.Razorpay(options);
        rzpWindow.on('payment.failed', function (res) {
          setError(`Payment failed: ${res.error.description}`);
        });
        rzpWindow.open();
      } catch (payErr) {
        // Fallback simulation for test environment
        console.warn('Razorpay popup unavailable, verifying test payment:', payErr);
        await api.post('/payments/verify', {
          orderId: createdOrder._id,
          isSimulated: true
        });

        triggerCelebration();
        dispatch(clearCart());
        navigate(`/track/${createdOrder._id}`);
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore confetti error
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-100 text-center shadow-sm">
        <p className="text-gray-600 font-bold mb-4">No items in your cart to checkout.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">
        Review & Complete Order
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center space-x-2 text-xs font-bold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>1. Select Delivery Address</span>
              </h3>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewAddressForm ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="mb-6 p-4 bg-gray-50 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-gray-700">Add New Delivery Location</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Address Label (Home, Work)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="p-2 border rounded-xl text-xs bg-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="p-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <textarea
                  rows="2"
                  placeholder="Full Street Address, House/Flat No."
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full p-2 border rounded-xl text-xs bg-white"
                  required
                ></textarea>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="ZIP / Postal Code"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    className="p-2 border rounded-xl text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="p-2 border rounded-xl text-xs bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save & Use Address
                </button>
              </form>
            )}

            {/* Saved Addresses List */}
            {savedAddressesList.length > 0 ? (
              <div className="space-y-3">
                {savedAddressesList.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      selectedAddressIndex === idx
                        ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="deliveryAddress"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="mt-1 text-orange-500 focus:ring-orange-500"
                        />
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                            {addr.label || 'Home'}
                          </span>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {addr.street}, {addr.city} {addr.zipCode}
                          </p>
                          {addr.phone && (
                            <p className="text-[11px] text-gray-400 mt-1">📞 {addr.phone}</p>
                          )}
                        </div>
                      </div>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No saved address yet. Please click "+ Add New" above to enter your location.
              </p>
            )}
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <span>2. Choose Payment Method</span>
            </h3>

            <div className="space-y-3">
              {/* Option 1: Razorpay Online */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Online Payment (Razorpay)</p>
                      <p className="text-[11px] text-gray-500">UPI, Cards, NetBanking, Wallets</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-orange-500" />
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-gray-500">Pay cash or UPI upon delivery at doorstep</p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-emerald-500" />
                </div>
              </label>

              {/* Option 3: Instant Demo UPI */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Instant Demo UPI Simulator</p>
                      <p className="text-[11px] text-gray-500">Test seamless simulated instant payment</p>
                    </div>
                  </div>
                  <QrCode className="w-5 h-5 text-purple-500" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            {/* Restaurant Name */}
            <p className="text-xs text-gray-500 mb-3">
              From <strong className="text-gray-900">{restaurantName || 'Restaurant'}</strong>
            </p>

            {/* Items Mini List */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i._id} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate max-w-[140px]">
                    {i.quantity}x {i.name}
                  </span>
                  <span className="font-bold text-gray-900">₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5% GST)</span>
                <span>₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-orange-600 text-lg">₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>{loading ? 'Processing...' : `Place Order • ₹${totalAmount}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Encrypted & Authenticated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
