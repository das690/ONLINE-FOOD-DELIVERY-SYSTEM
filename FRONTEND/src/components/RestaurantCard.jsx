// src/components/RestaurantCard.jsx
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  // Fallback image in case the restaurant doesn't have one
  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60";

  return (
    <Link to={`/restaurant/${restaurant._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <img 
          src={restaurant.imageUrl || defaultImage} 
          alt={restaurant.name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
              ★ {restaurant.rating || "New"}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
          <div className="mt-auto pt-3 border-t text-sm text-gray-500 flex justify-between">
            <span>📍 {restaurant.location}</span>
            <span className="text-orange-500 font-medium">View Menu ➔</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;