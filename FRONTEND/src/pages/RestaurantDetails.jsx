// src/pages/RestaurantDetails.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import MenuItem from '../components/MenuItem';

const RestaurantDetails = () => {
  const { id } = useParams(); // Gets the restaurant ID from the URL
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${id}`);
        setRestaurant(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load restaurant details.');
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-xl text-gray-600">Loading menu...</div>;
  if (error) return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;
  if (!restaurant) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 bg-gray-200 relative">
          <img 
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3"} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
            <h1 className="text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
            <p className="text-white text-lg">{restaurant.cuisine} • {restaurant.location}</p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>
        
        {restaurant.menu && restaurant.menu.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurant.menu.map((item) => (
              <MenuItem key={item._id} item={item} restaurantId={restaurant._id} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
            This restaurant hasn't added any menu items yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;