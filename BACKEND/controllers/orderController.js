// controllers/orderController.js
const Order = require('../models/Order');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, totalAmount, deliveryAddress, scheduledDeliveryTime } = req.body;

    const order = new Order({
      customer: req.user._id, // Set by authMiddleware
      restaurant: restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      scheduledDeliveryTime // Optional: If provided, handles your scheduling requirement
    });

    const savedOrder = await order.save();
    
    // We will emit a Socket.io event here later to notify the restaurant
    req.app.get('io').to(`restaurant_${restaurantId}`).emit('newOrder', savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Live Tracking)
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant Owner / Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g., 'Preparing', 'Out for Delivery'
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // The Magic: Emit a Socket.io event specifically to the customer tracking this order
    req.app.get('io').to(`order_${orderId}`).emit('statusUpdate', { orderId, status });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's order history
// @route   GET /api/orders/myorders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders for a specific restaurant
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private (Restaurant Owner / Admin)
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch orders and populate the customer's name so the owner sees who ordered
    const orders = await Order.find({ restaurant: restaurantId })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 }); // Newest orders first

    // Map the output to match what the frontend expects
    const formattedOrders = orders.map(order => ({
      ...order._doc,
      customerName: order.customer?.name || 'Guest'
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};