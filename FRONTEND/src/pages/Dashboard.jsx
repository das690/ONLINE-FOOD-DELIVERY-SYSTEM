import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../redux/cartSlice';
import { updateUserProfile, setSavedAddresses } from '../redux/authSlice';
import api from '../utils/api';
import {
  ShoppingBag,
  MapPin,
  User,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  CheckCircle2,
  Bike,
  ChefHat,
  Eye,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Owner / Admin metrics
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    isVeg: true,
    isBestseller: false
  });
  const [menuSaving, setMenuSaving] = useState(false);

  const isOwnerOrAdmin = user?.role === 'restaurant_owner' || user?.role === 'admin';

  // Fetch orders based on role
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      if (isOwnerOrAdmin) {
        const allR = await api.get('/restaurants');
        const store = allR.data.find(r => r.owner === user._id) || allR.data[0];
        setMyRestaurant(store);

        if (store) {
          const res = await api.get(`/orders/restaurant/${store._id}`);
          setOrders(res.data);
        } else {
          const res = await api.get('/orders/myorders');
          setOrders(res.data);
        }
      } else {
        const res = await api.get('/orders/myorders');
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, user?.role]);

  // Update order status (Owner / Admin)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Reorder items (Customer)
  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        dispatch(addToCart({
          item: {
            _id: item.menuItemId || item._id,
            name: item.menuItemName || item.name,
            price: item.price,
            image: item.image,
            isVeg: item.isVeg
          },
          restaurantId: order.restaurant?._id || order.restaurant,
          restaurantName: order.restaurant?.name || 'Restaurant'
        }));
      });
      navigate('/cart');
    }
  };

  // Profile save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const response = await api.put('/auth/profile', profileForm);
      dispatch(updateUserProfile(response.data.user));
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Add menu item (Owner)
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!myRestaurant) return;
    setMenuSaving(true);
    try {
      await api.post(`/restaurants/${myRestaurant._id}/menu`, menuForm);
      alert('New dish added to menu!');
      setMenuForm({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image: '',
        isVeg: true,
        isBestseller: false
      });
      const rRes = await api.get(`/restaurants/${myRestaurant._id}`);
      setMyRestaurant(rRes.data);
    } catch (err) {
      alert('Failed to add menu item');
    } finally {
      setMenuSaving(false);
    }
  };

  // Metrics for Owner / Admin
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-surface-200/80 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-surface-900">{user?.name}</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-100 text-brand-700">
                {user?.role === 'restaurant_owner' ? 'Restaurant Partner' : user?.role}
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-1 font-medium">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="text-xs font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 px-4 py-2.5 rounded-xl transition flex items-center space-x-2 touch-target"
        >
          <RefreshCw className="w-3.5 h-3.5 text-surface-500" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards (for Restaurant Owner & Admin) */}
      {isOwnerOrAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-surface-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-black uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-black text-surface-900">{orders.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-surface-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-black uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-surface-900">₹{totalRevenue}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-surface-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-black uppercase tracking-wider">Active Deliveries</p>
              <h3 className="text-2xl font-black text-purple-600">{activeOrdersCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-surface-200/80 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-surface-400 font-black uppercase tracking-wider">Store Rating</p>
              <h3 className="text-2xl font-black text-surface-900">{myRestaurant?.rating || '4.8'} ★</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex space-x-2 sm:space-x-3 mb-6 pb-2 border-b border-surface-200/80 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap touch-target ${
            activeTab === 'orders'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
              : 'text-surface-600 hover:bg-surface-100 bg-white'
          }`}
        >
          {isOwnerOrAdmin ? 'Live Store Orders' : 'My Orders'}
        </button>

        {!isOwnerOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap touch-target ${
              activeTab === 'addresses'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-surface-600 hover:bg-surface-100 bg-white'
            }`}
          >
            Saved Addresses
          </button>
        )}

        {isOwnerOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap touch-target ${
              activeTab === 'menu'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-surface-600 hover:bg-surface-100 bg-white'
            }`}
          >
            Manage Restaurant Menu
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black transition whitespace-nowrap touch-target ${
            activeTab === 'profile'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
              : 'text-surface-600 hover:bg-surface-100 bg-white'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* TAB 1: ORDERS STREAM */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-surface-500 font-bold">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-surface-200 shadow-xs max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-surface-900 mb-1">No orders yet</h3>
              <p className="text-xs text-surface-500 mb-6 font-medium">Explore the restaurant menu and order your favorite meal.</p>
              <Link to="/" className="bg-brand-500 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md inline-block">
                Browse Food
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-surface-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-surface-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-surface-900">
                      {order.restaurant?.name || myRestaurant?.name || 'Restaurant'}
                    </h4>

                    {/* Customer info for owner */}
                    {isOwnerOrAdmin && order.customerName && (
                      <p className="text-xs text-surface-600 font-medium">
                        Customer: <strong>{order.customerName}</strong> • {order.deliveryAddress?.street || 'Local Address'}
                      </p>
                    )}

                    <div className="text-xs text-surface-600 flex flex-wrap gap-2 pt-1">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="bg-surface-50 border border-surface-200 px-2.5 py-1 rounded-lg font-medium">
                          {item.quantity}x {item.menuItemName || item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col md:items-end space-y-3 w-full md:w-auto shrink-0">
                    <span className="text-xl font-black text-surface-900">₹{order.totalAmount}</span>

                    {/* Customer Actions */}
                    {!isOwnerOrAdmin && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/track/${order._id}`}
                          className="bg-brand-500 hover:bg-brand-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition touch-target"
                        >
                          Track Live
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="border border-surface-200 text-surface-700 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-surface-50 transition touch-target"
                        >
                          Reorder
                        </button>
                      </div>
                    )}

                    {/* Owner Status Advance Buttons */}
                    {isOwnerOrAdmin && (
                      <div className="flex flex-wrap gap-1.5">
                        {order.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                            className="bg-blue-600 text-white font-black text-xs px-3.5 py-2 rounded-xl hover:bg-blue-700 touch-target"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                            className="bg-amber-500 text-white font-black text-xs px-3.5 py-2 rounded-xl hover:bg-amber-600 touch-target"
                          >
                            Start Cooking
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                            className="bg-purple-600 text-white font-black text-xs px-3.5 py-2 rounded-xl hover:bg-purple-700 touch-target"
                          >
                            Dispatch with Rider
                          </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                            className="bg-emerald-600 text-white font-black text-xs px-3.5 py-2 rounded-xl hover:bg-emerald-700 touch-target"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED ADDRESSES (Customer) */}
      {activeTab === 'addresses' && !isOwnerOrAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200/80 shadow-xs max-w-2xl">
          <h3 className="text-base font-black text-surface-900 mb-4">Saved Delivery Locations</h3>
          {user?.savedAddresses && user.savedAddresses.length > 0 ? (
            <div className="space-y-3">
              {user.savedAddresses.map((addr) => (
                <div key={addr._id} className="p-4 rounded-2xl border border-surface-200 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-brand-600">
                      {addr.label}
                    </span>
                    <p className="text-xs text-surface-700 mt-1 font-medium">{addr.street}, {addr.city} {addr.zipCode}</p>
                    {addr.phone && <p className="text-[11px] text-surface-400 mt-0.5 font-semibold">📞 {addr.phone}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.delete(`/auth/address/${addr._id}`);
                      const uRes = await api.get('/auth/me');
                      dispatch(setSavedAddresses(uRes.data.savedAddresses));
                    }}
                    className="text-surface-300 hover:text-rose-500 p-2 touch-target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-500">No saved address yet.</p>
          )}
        </div>
      )}

      {/* TAB 3: RESTAURANT MENU MANAGER (Owner) */}
      {activeTab === 'menu' && isOwnerOrAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200/80 shadow-xs max-w-2xl">
          <h3 className="text-base font-black text-surface-900 mb-4">Add Dish to Restaurant Menu</h3>
          <form onSubmit={handleAddMenuItem} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Paneer Butter Masala"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Description</label>
              <textarea
                rows="2"
                placeholder="Fresh ingredients, spices, accompaniments..."
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-surface-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="299"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-surface-700 mb-1">Category</label>
                <select
                  value={menuForm.category}
                  onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                  className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
                >
                  <option value="Starters">Starters</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Biryani">Biryani</option>
                  <option value="Breads">Breads</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={menuForm.image}
                onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer touch-target">
                <input
                  type="checkbox"
                  checked={menuForm.isVeg}
                  onChange={(e) => setMenuForm({ ...menuForm, isVeg: e.target.checked })}
                />
                <span>Pure Veg</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer touch-target">
                <input
                  type="checkbox"
                  checked={menuForm.isBestseller}
                  onChange={(e) => setMenuForm({ ...menuForm, isBestseller: e.target.checked })}
                />
                <span>Mark as Bestseller</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={menuSaving}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition touch-target"
            >
              {menuSaving ? 'Adding...' : 'Add Dish to Menu'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200/80 shadow-xs max-w-xl">
          <h3 className="text-base font-black text-surface-900 mb-4">Account Profile</h3>

          {profileMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-100 text-surface-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-surface-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-3 border border-surface-200 rounded-xl text-xs sm:text-sm bg-surface-50 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition touch-target"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
