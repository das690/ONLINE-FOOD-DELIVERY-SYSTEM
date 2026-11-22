import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../utils/api';
import LiveMapSimulator from '../components/LiveMapSimulator';
import InvoiceModal from '../components/InvoiceModal';
import { addToast } from '../redux/uiSlice';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  Phone,
  AlertCircle,
  ArrowLeft,
  XCircle,
  FileText,
  MapPin,
  ShieldCheck,
  Receipt,
  Leaf,
  Timer
} from 'lucide-react';

const steps = [
  { key: 'Pending', label: 'Order Placed', desc: 'Received by kitchen', icon: Clock },
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Restaurant accepted', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Kitchen Preparing', desc: 'Chef cooking your meal', icon: ChefHat },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Partner on the way', icon: Bike },
  { key: 'Delivered', label: 'Delivered', desc: 'Bon Appétit!', icon: PackageCheck }
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(24 * 60);

  // Live countdown timer calculation
  useEffect(() => {
    if (!order?.createdAt) return;

    const estMinutes = order.estimatedDeliveryMinutes || 30;
    const orderTime = new Date(order.createdAt).getTime();
    const targetTime = orderTime + estMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const remainingMs = targetTime - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftSeconds(0);
      } else {
        setTimeLeftSeconds(Math.floor(remainingMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.createdAt, order?.estimatedDeliveryMinutes]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
        setCurrentStatus(response.data.status);
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const socketServerUrl = import.meta.env.VITE_SOCKET_URL || 'https://online-food-delivery-system-i0ik.onrender.com';
    const socketInstance = io(socketServerUrl);
    setSocket(socketInstance);

    socketInstance.emit('joinOrderRoom', orderId);

    socketInstance.on('statusUpdate', (data) => {
      if (data.status) {
        setCurrentStatus(data.status);
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
        dispatch(addToast({
          message: `Order #${orderId.slice(-6).toUpperCase()} is now ${data.status}! 🛵`,
          type: data.status === 'Delivered' ? 'success' : 'info'
        }));
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
      setCurrentStatus('Cancelled');
      setOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : prev));
      alert('Order cancelled successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-surface-500 font-bold">Connecting to live tracker radar...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2">Order Not Found</h3>
        <p className="text-xs text-rose-600 mb-6">Could not locate order ID: {orderId}</p>
        <Link to="/" className="bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          to="/"
          className="text-xs font-bold text-surface-500 hover:text-brand-600 flex items-center space-x-1.5 transition touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* View Tax Invoice Button */}
          <button
            type="button"
            onClick={() => setIsInvoiceOpen(true)}
            className="text-xs font-bold text-surface-700 dark:text-stone-200 bg-surface-100 hover:bg-surface-200 dark:bg-stone-800 dark:hover:bg-stone-700 px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 touch-target border border-surface-200 dark:border-stone-700"
          >
            <Receipt className="w-3.5 h-3.5 text-brand-500" />
            <span>Tax Invoice</span>
          </button>

          {/* Cancellation Button */}
          {(currentStatus === 'Pending' || currentStatus === 'Confirmed') && (
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 touch-target"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-surface-200/80 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-surface-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
              Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900 mt-2">
              {order.restaurant?.name || 'Restaurant'}
            </h1>
            <p className="text-xs text-surface-500 mt-0.5 font-medium">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-black text-surface-900">₹{order.totalAmount}</span>
            <span className="block text-xs font-extrabold text-emerald-600 uppercase mt-0.5">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
            </span>
          </div>
        </div>

        {/* Live Delivery Countdown Timer Banner */}
        {currentStatus !== 'Cancelled' && currentStatus !== 'Delivered' && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-200/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black animate-pulse shadow-md">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-brand-600">
                  Estimated Delivery Countdown
                </p>
                <h4 className="text-base sm:text-lg font-black text-surface-900">
                  {timeLeftSeconds > 0
                    ? `${Math.floor(timeLeftSeconds / 60)}m ${String(timeLeftSeconds % 60).padStart(2, '0')}s remaining`
                    : 'Arriving any moment! 🛵'}
                </h4>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              ⚡ On Schedule
            </span>
          </div>
        )}

        {/* Live Status Progress Stepper */}
        {currentStatus === 'Cancelled' ? (
          <div className="my-8 p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700">
            <XCircle className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">This order has been cancelled</h4>
              <p className="text-xs text-rose-600 mt-0.5 font-medium">
                If payment was deducted, a refund will be processed to the original payment mode.
              </p>
            </div>
          </div>
        ) : (
          <div className="my-8">
            <div className="relative">
              {/* Stepper Connecting Bar (Desktop) */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-surface-100 -z-0 hidden md:block">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 via-amber-400 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`
                  }}
                ></div>
              </div>

              {/* Step Badges */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex md:flex-col items-center md:text-center space-x-3 md:space-x-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm shrink-0 ${
                          isCurrent
                            ? 'bg-brand-500 text-white ring-4 ring-brand-100 scale-110 shadow-glow-brand'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-surface-100 text-surface-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="md:mt-3">
                        <p className={`text-xs font-black leading-tight ${isDone ? 'text-surface-900' : 'text-surface-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-surface-400 hidden md:block mt-0.5 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Map Tracking Simulation */}
      {currentStatus !== 'Cancelled' && (
        <div className="mb-6">
          <LiveMapSimulator
            order={order}
            currentStatus={currentStatus}
            socket={socket}
          />
        </div>
      )}

      {/* Delivery Partner Profile Card */}
      {currentStatus !== 'Cancelled' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-surface-200/80 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={order.deliveryPartner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Delivery Partner"
              className="w-14 h-14 rounded-2xl object-cover shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-black text-surface-900">
                  {order.deliveryPartner?.name || 'Rahul Verma'}
                </h4>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md">
                  ★ {order.deliveryPartner?.rating || 4.8}
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5 font-medium">
                Vehicle: {order.deliveryPartner?.vehicleNumber || 'KA-01-EA-2024'}
              </p>
              <p className="text-[11px] text-emerald-600 font-extrabold mt-0.5 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vaccinated & Sanitized Partner</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`tel:${order.deliveryPartner?.phone || '9876543210'}`}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-black text-xs rounded-xl transition active:scale-95 touch-target"
            >
              <Phone className="w-4 h-4" />
              <span>Call Partner</span>
            </a>
          </div>
        </div>
      )}

      {/* Order Items & Receipt Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-surface-200/80">
        <h3 className="text-base font-black text-surface-900 mb-4 pb-3 border-b border-surface-100 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-brand-500" />
          <span>Order Details & Receipt</span>
        </h3>

        <div className="space-y-3 mb-6">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs sm:text-sm text-surface-700">
              <div className="flex items-center space-x-2.5">
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
                <span className="font-bold">
                  {item.quantity}x {item.menuItemName || item.name}
                </span>
              </div>
              <span className="font-black text-surface-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 text-xs sm:text-sm text-surface-500 pt-4 border-t border-surface-100">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-surface-900">₹{order.subtotal || order.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-surface-900">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 40}`}</span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between">
              <span>Taxes (5% GST)</span>
              <span className="font-bold text-surface-900">₹{order.tax}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount</span>
              <span>- ₹{order.discount}</span>
            </div>
          )}
          {order.tip > 0 && (
            <div className="flex justify-between text-brand-600 font-bold">
              <span>Delivery Partner Tip</span>
              <span>+ ₹{order.tip}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-surface-900 pt-3 border-t border-surface-100">
            <span>Total Paid</span>
            <span className="text-brand-600 text-lg">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Eco Preferences Badges */}
        {order.deliveryPreferences && (
          <div className="mt-4 pt-3 border-t border-surface-100 flex flex-wrap gap-2 text-xs">
            {order.deliveryPreferences.noCutlery && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center space-x-1 border border-emerald-200/60">
                <Leaf className="w-3.5 h-3.5" />
                <span>No plastic cutlery requested</span>
              </span>
            )}
            {order.deliveryPreferences.contactless && (
              <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold border border-brand-200/60">
                🚪 Contactless delivery
              </span>
            )}
            {order.deliveryPreferences.dontRingBell && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200/60">
                🔕 Do not ring doorbell
              </span>
            )}
          </div>
        )}

        {/* Delivery Address Note */}
        {order.deliveryAddress && (
          <div className="mt-6 pt-4 border-t border-surface-100 text-xs text-surface-600">
            <span className="font-black text-surface-800 flex items-center space-x-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>Delivering to:</span>
            </span>
            <p className="font-medium text-surface-700 pl-5">
              {order.deliveryAddress.fullAddress || `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}`}
            </p>
          </div>
        )}
      </div>

      {/* Tax Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};

export default TrackOrder;
