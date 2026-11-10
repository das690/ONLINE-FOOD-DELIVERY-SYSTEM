// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart'; 
import Checkout from './pages/Checkout'; 
import TrackOrder from './pages/TrackOrder'; 
import Dashboard from './pages/Dashboard'; // NEW IMPORT

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track/:orderId" element={<TrackOrder />} /> 
          <Route path="/dashboard" element={<Dashboard />} /> {/* Updated */}
        </Routes>
      </main>
    </div>
  );
}

export default App;