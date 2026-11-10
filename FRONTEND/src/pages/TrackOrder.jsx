// src/pages/TrackOrder.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);

  // Define the progression of statuses
  const statusSteps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
  
  // Calculate which step we are on (0 to 3)
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  useEffect(() => {
    // 1. Fetch initial order details when the page loads
    const fetchOrder = async () => {
      try {
        // We will need a quick route in the backend to get a single order, 
        // but for now, we'll fetch all user's orders and find this one.
        const response = await api.get('/orders/myorders');
        const foundOrder = response.data.find(o => o._id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
          setCurrentStatus(foundOrder.status);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchOrder();

    // 2. Connect to the Socket.io Server
    const socket = io('http://localhost:5000');

    // 3. Tell the server we want to track this specific order
    socket.emit('joinOrderRoom', orderId);

    // 4. Listen for live updates from the restaurant
    socket.on('statusUpdate', (data) => {
      console.log('Live update received:', data);
      setCurrentStatus(data.status);
    });

    // Cleanup the connection when the user leaves the page
    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  if (loading) return <div className="text-center mt-20 text-xl">Loading live tracker...</div>;
  if (!order) return <div className="text-center mt-20 text-xl text-red-500">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center border-b pb-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</h2>
          <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-orange-500">₹{order.totalAmount}</p>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Live Progress Bar UI */}
      <div className="relative mb-12 mt-8">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div 
            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500 ease-in-out"
          ></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
          {statusSteps.map((step, index) => (
            <div 
              key={step} 
              className={`text-center w-1/4 ${index <= currentStepIndex ? 'text-green-600' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Items Ordered</h3>
        <ul className="space-y-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between text-gray-700 border-b border-gray-200 pb-2 last:border-0 last:pb-0">
              <span>{item.quantity}x {item.menuItemName || item.name}</span>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="text-center mt-8">
        <Link to="/" className="text-orange-500 font-bold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TrackOrder;