// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Protect the route
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'restaurant_owner') {
      alert('Access Denied. You must be logged in as a restaurant owner.');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch the restaurant's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 1. Find the ID of the restaurant this user owns
        const myRestaurants = await api.get('/restaurants'); 
        const myStore = myRestaurants.data.find(r => r.owner === user._id);

        if (!myStore) {
          setError("You haven't created a restaurant profile yet.");
          setLoading(false);
          return;
        }

        // 2. Fetch the orders for that specific restaurant
        const response = await api.get(`/orders/restaurant/${myStore._id}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch orders.');
        setLoading(false);
      }
    };

    if (user?.role === 'restaurant_owner') {
      fetchOrders();
    }
  }, [user]);

  // Function to trigger the WebSocket status update
  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state to reflect the change immediately
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert(`Order updated to ${newStatus}`);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600 transition">
          + Add Menu Item
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Orders</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {orders.length === 0 && !error ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No active orders right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center">
              
              {/* Order Info */}
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-bold text-lg text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold uppercase">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Customer:</strong> {order.customerName || "Customer"}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Total:</strong> ₹{order.totalAmount}
                </p>
                <div className="text-sm text-gray-500">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.quantity}x {item.name || item.menuItemName}{i < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex space-x-2">
                {order.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Preparing')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-yellow-600 transition"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'Preparing' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Out for Delivery')}
                    className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-600 transition"
                  >
                    Send Out for Delivery
                  </button>
                )}
                {order.status === 'Out for Delivery' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Delivered')}
                    className="bg-green-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-600 transition"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;