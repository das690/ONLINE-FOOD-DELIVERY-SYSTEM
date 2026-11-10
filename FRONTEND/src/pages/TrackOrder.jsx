import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import LiveMapSimulator from '../components/LiveMapSimulator';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowLeft,
  XCircle,
  FileText
} from 'lucide-react';

const steps = [
  { key: 'Pending', label: 'Order Placed', desc: 'Received by kitchen', icon: Clock },
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Restaurant accepted', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Kitchen Preparing', desc: 'Chef is cooking your meal', icon: ChefHat },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Partner on the way', icon: Bike },
  { key: 'Delivered', label: 'Delivered', desc: 'Bon Appétit!', icon: PackageCheck }
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // 1. Fetch initial order details
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

    // 2. Setup Socket.io connection for live real-time updates
    const socketServerUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socketInstance = io(socketServerUrl);
    setSocket(socketInstance);

    socketInstance.emit('joinOrderRoom', orderId);

    // Listen for order status updates
    socketInstance.on('statusUpdate', (data) => {
      console.log('Live Status Update:', data);
      if (data.status) {
        setCurrentStatus(data.status);
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
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
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold">Connecting to live tracker...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2">Order Not Found</h3>
        <p className="text-xs text-rose-600 mb-6">Could not locate order ID: {orderId}</p>
        <Link to="/" className="bg-rose-600 text-white font-bold px-6 py-2 rounded-xl text-xs">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="text-xs font-bold text-gray-500 hover:text-orange-600 flex items-center space-x-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>

        {/* Cancellation Button (if status is Pending or Confirmed) */}
        {(currentStatus === 'Pending' || currentStatus === 'Confirmed') && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
          </button>
        )}
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
              Order #{order._id.slice(-6).toUpperCase()}
            </span>
            <h1 className="text-2xl font-black text-gray-900 mt-2">
              {order.restaurant?.name || 'Restaurant'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-gray-900">₹{order.totalAmount}</span>
            <span className="block text-xs font-bold text-emerald-600 uppercase mt-0.5">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
            </span>
          </div>
        </div>

        {/* Live Status Progress Stepper */}
        {currentStatus === 'Cancelled' ? (
          <div className="my-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700">
            <XCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold">This order has been cancelled</h4>
              <p className="text-xs text-rose-600">If payment was deducted, a refund will be processed to the original payment mode.</p>
            </div>
          </div>
        ) : (
          <div className="my-8">
            <div className="relative">
              {/* Stepper Connecting Bar */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-gray-100 -z-0 hidden md:block">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
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
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                          isCurrent
                            ? 'bg-orange-500 text-white ring-4 ring-orange-100 scale-110 shadow-orange-500/30'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="md:mt-3">
                        <p className={`text-xs font-bold leading-tight ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-gray-400 hidden md:block mt-0.5">{step.desc}</p>
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
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={order.deliveryPartner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Delivery Partner"
              className="w-14 h-14 rounded-2xl object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-gray-900">
                  {order.deliveryPartner?.name || 'Rahul Verma'}
                </h4>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  ★ {order.deliveryPartner?.rating || 4.8}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Vehicle: {order.deliveryPartner?.vehicleNumber || 'KA-01-EA-2024'}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Vaccinated & Sanitized Partner
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`tel:${order.deliveryPartner?.phone || '9876543210'}`}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs rounded-xl transition active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call Partner</span>
            </a>
          </div>
        </div>
      )}

      {/* Order Items & Receipt Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h3 className="text-base font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-orange-500" />
          <span>Order Details & Receipt</span>
        </h3>

        <div className="space-y-3 mb-6">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-xs border-2 flex items-center justify-center ${
                    item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  ></span>
                </span>
                <span className="font-medium">
                  {item.quantity}x {item.menuItemName || item.name}
                </span>
              </div>
              <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal || order.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee || 40}`}</span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between">
              <span>Taxes (5% GST)</span>
              <span>₹{order.tax}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount</span>
              <span>- ₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-gray-900 pt-3 border-t border-gray-100">
            <span>Total Paid</span>
            <span className="text-orange-600">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Delivery Address Note */}
        {order.deliveryAddress && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <span className="font-bold text-gray-800 block mb-1">Delivering to:</span>
            <p>{order.deliveryAddress.fullAddress || `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}`}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
