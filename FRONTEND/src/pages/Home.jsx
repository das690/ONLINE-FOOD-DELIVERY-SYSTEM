// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch restaurants when the component mounts
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants. Is your backend running?');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter restaurants based on the search bar
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-gray-600">Loading restaurants...</div>;
  if (error) return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;

  return (
    <div>
      {/* Hero Section & Search */}
      <div className="bg-orange-500 rounded-xl p-8 mb-8 text-center text-white shadow-lg">
        <h1 className="text-4xl font-extrabold mb-4">Hungry? We got you.</h1>
        <p className="text-lg mb-6">Discover the best food and drinks in your area</p>
        <input 
          type="text" 
          placeholder="Search for restaurants or cuisines..." 
          className="w-full max-w-xl px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Restaurant Grid */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Top Restaurants near you</h2>
      
      {filteredRestaurants.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No restaurants found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;