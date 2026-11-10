// src/pages/Checkout.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/cartSlice';
import api from '../utils/api';

const Checkout = () => {
  const { items, totalAmount, restaurantId } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalAmount = totalAmount + 40; // Including delivery fee

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!address) {
      setError('Please provide a delivery address');
      setLoading(false);
      return;
    }

    try {
      // 1. Create the Order in our own MongoDB Database
      const orderResponse = await api.post('/orders', {
        restaurantId,
        items,
        totalAmount: finalAmount,
        deliveryAddress: address,
      });

      const orderId = orderResponse.data._id;

      // 2. Request a Razorpay Order ID from our backend
      const razorpayResponse = await api.post('/payments/create-order', {
        orderId: orderId,
      });

      const { order: rzpOrder } = razorpayResponse.data;

      // 3. Configure the Razorpay Pop-up UI
      const options = {
        key: "rzp_test_TvD1fU6ZsxKH8f", // Replace with your actual Test Key ID
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "FoodExpress",
        description: "Food Delivery Order",
        order_id: rzpOrder.id,
        handler: async function (response) {
          // 4. This function runs if payment is SUCCESSFUL
          
          // In a production app, you would verify this signature on the backend.
          // For this project, we will update the order status directly.
          await api.put(`/orders/${orderId}/status`, { status: 'Preparing' });
          
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          
          dispatch(clearCart());
          // Redirect the user to the live tracking page!
          navigate(`/track/${orderId}`);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#f97316", // Tailwind orange-500
        },
      };

      // 5. Open the Razorpay UI
      const rzpWindow = new window.Razorpay(options);
      rzpWindow.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      rzpWindow.open();
      
    } catch (err) {
      console.error(err);
      setError('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <div className="text-center mt-20 text-xl text-gray-600">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Checkout</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handlePayment} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Delivery Address</label>
          <textarea 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" 
            rows="3"
            placeholder="Enter your full street address, apartment number, and zip code"
            required 
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Items ({items.length})</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-4 border-b pb-4">
            <span>Delivery Fee</span>
            <span>₹40</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-gray-800">
            <span>Total to Pay</span>
            <span className="text-orange-500">₹{finalAmount}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white font-bold py-4 rounded text-xl hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : `Pay ₹${finalAmount} securely`}
        </button>
      </form>
    </div>
  );
};

export default Checkout;