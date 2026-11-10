// src/components/MenuItem.jsx
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

const MenuItem = ({ item, restaurantId }) => {
  const dispatch = useDispatch();

  // Fallback image for food
  const defaultFoodImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";

  const handleAddToCart = () => {
    dispatch(addToCart({ item, restaurantId }));
    // We could add a nice toast notification here later
  };

  return (
    <div className="flex border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      <div className="w-1/3">
        <img 
          src={item.image || defaultFoodImg} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
            <span className="font-bold text-orange-500">₹{item.price}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          {item.nutritionalInfo && (
            <p className="text-xs text-gray-400 mt-2">🌱 {item.nutritionalInfo}</p>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="mt-4 bg-white text-orange-500 border border-orange-500 px-4 py-1 rounded hover:bg-orange-500 hover:text-white transition font-medium self-end"
        >
          + ADD
        </button>
      </div>
    </div>
  );
};

export default MenuItem;