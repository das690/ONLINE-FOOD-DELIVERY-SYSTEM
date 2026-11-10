// src/pages/Cart.jsx
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, clearCart } from '../redux/cartSlice';

const Cart = () => {
  const { items, totalAmount, restaurantId } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to place an order.');
      navigate('/login');
      return;
    }
    // We will navigate to a specific checkout page in the next step
    navigate('/checkout'); 
  };

  if (items.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any food yet.</p>
        <Link to="/" className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
        <button 
          onClick={() => dispatch(clearCart())}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between items-center border-b pb-4">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
              <p className="text-gray-500 text-sm">₹{item.price}</p>
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center space-x-3 bg-gray-100 rounded px-2 py-1">
              <button 
                onClick={() => dispatch(removeFromCart(item._id))}
                className="text-gray-600 hover:text-orange-500 font-bold px-2"
              >
                -
              </button>
              <span className="font-bold">{item.quantity}</span>
              <button 
                onClick={() => dispatch(addToCart({ item, restaurantId }))}
                className="text-gray-600 hover:text-orange-500 font-bold px-2"
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-bold text-gray-800">
              ₹{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-bold">₹{totalAmount}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-bold">₹40</span>
        </div>
        <div className="flex justify-between items-center text-xl border-t pt-4">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-extrabold text-orange-500">₹{totalAmount + 40}</span>
        </div>
        
        <button 
          onClick={handleCheckout}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded mt-6 hover:bg-orange-600 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;