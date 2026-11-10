const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');

// @desc    Place a new order with server-side price recalculation & validation
// @route   POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod = 'razorpay',
      couponCode = '',
      specialInstructions = ''
    } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Restaurant and items are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // 1. Verify item prices from restaurant menu to prevent price tampering
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const menuItem = restaurant.menu.find(
        m => m._id.toString() === (item._id || item.menuItemId || '').toString()
      ) || restaurant.menu.find(m => m.name.toLowerCase() === (item.name || item.menuItemName || '').toLowerCase());

      const itemPrice = menuItem ? menuItem.price : Number(item.price || 0);
      const itemName = menuItem ? menuItem.name : (item.name || item.menuItemName || 'Item');
      const itemImage = menuItem ? menuItem.image : (item.image || '');
      const itemVeg = menuItem ? menuItem.isVeg : (item.isVeg !== undefined ? item.isVeg : true);
      const qty = Math.max(1, Number(item.quantity || 1));

      subtotal += itemPrice * qty;

      verifiedItems.push({
        menuItemId: menuItem ? menuItem._id : null,
        menuItemName: itemName,
        name: itemName,
        quantity: qty,
        price: itemPrice,
        image: itemImage,
        isVeg: itemVeg,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // 2. Compute delivery fee & taxes
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05); // 5% GST

    // 3. Validate coupon if provided
    let discount = 0;
    let appliedCoupon = '';

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true
      });

      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minOrderAmount) {
        discount = Math.min(
          Math.round((subtotal * coupon.discountPercent) / 100),
          coupon.maxDiscount || 150
        );
        appliedCoupon = coupon.code;
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee + tax - discount);

    // 4. Format delivery address
    let formattedAddress = {};
    if (typeof deliveryAddress === 'string') {
      formattedAddress = { fullAddress: deliveryAddress, street: deliveryAddress, city: restaurant.location || 'Local' };
    } else if (deliveryAddress) {
      formattedAddress = {
        street: deliveryAddress.street || '',
        city: deliveryAddress.city || '',
        state: deliveryAddress.state || '',
        zipCode: deliveryAddress.zipCode || '',
        phone: deliveryAddress.phone || req.user.phone || '',
        fullAddress: `${deliveryAddress.street || ''}, ${deliveryAddress.city || ''} ${deliveryAddress.zipCode || ''}`.trim()
      };
    }

    const initialStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';

    const order = new Order({
      customer: req.user._id,
      restaurant: restaurantId,
      items: verifiedItems,
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      couponCode: appliedCoupon,
      status: initialStatus,
      statusTimeline: [
        { status: 'Order Placed', timestamp: new Date(), note: 'Order successfully submitted' },
        ...(paymentMethod === 'cod' ? [{ status: 'Confirmed', timestamp: new Date(), note: 'Order confirmed with Cash on Delivery' }] : [])
      ],
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
      deliveryAddress: formattedAddress,
      specialInstructions: specialInstructions || '',
      deliveryPartner: {
        name: 'Rahul Verma',
        phone: '+91 98765 43210',
        vehicleNumber: 'KA-01-EA-2024',
        rating: 4.8,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      deliveryCoordinates: {
        lat: 12.9716,
        lng: 77.5946,
        progressPercent: 15
      }
    });

    const savedOrder = await order.save();

    // Populate for response and socket broadcast
    await savedOrder.populate('restaurant', 'name imageUrl location address');
    await savedOrder.populate('customer', 'name email phone');

    // Notify restaurant via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit('newOrder', savedOrder);
      io.emit('allOrdersUpdate', savedOrder);
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('placeOrder error:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name imageUrl location cuisine')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name imageUrl location address phone')
      .populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: customer, restaurant owner, or admin
    const isCustomer = order.customer && order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'restaurant_owner';

    if (!isCustomer && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// @desc    Get orders for restaurant
// @route   GET /api/orders/restaurant/:restaurantId
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurant: restaurantId })
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      customerName: order.customer?.name || 'Valued Customer'
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch restaurant orders', error: error.message });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('restaurant', 'name location')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(orderId).populate('restaurant', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status}`
    });

    // Update progress percentage according to step
    const progressMap = {
      'Pending': 10,
      'Confirmed': 25,
      'Preparing': 50,
      'Out for Delivery': 75,
      'Delivered': 100,
      'Cancelled': 0
    };
    if (order.deliveryCoordinates) {
      order.deliveryCoordinates.progressPercent = progressMap[status] || 50;
    }

    if (status === 'Delivered') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    // Emit live WebSocket update
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${orderId}`).emit('statusUpdate', {
        orderId,
        status,
        progressPercent: order.deliveryCoordinates?.progressPercent || 50,
        timeline: order.statusTimeline
      });
      io.emit('allOrdersUpdate', order);
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// @desc    Cancel order (if pending)
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'Pending' && order.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Cannot cancel order once food preparation has started' });
    }

    order.status = 'Cancelled';
    order.statusTimeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Cancelled by customer'
    });

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('statusUpdate', { orderId: order._id, status: 'Cancelled' });
    }

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};

// @desc    Simulate or stream driver GPS location for real-time tracking
// @route   PUT /api/orders/:id/location
exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { lat, lng, progressPercent } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.deliveryCoordinates = {
      lat: lat || order.deliveryCoordinates.lat,
      lng: lng || order.deliveryCoordinates.lng,
      progressPercent: progressPercent !== undefined ? progressPercent : order.deliveryCoordinates.progressPercent
    };

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('locationUpdate', {
        orderId: order._id,
        coordinates: order.deliveryCoordinates
      });
    }

    res.status(200).json({ success: true, coordinates: order.deliveryCoordinates });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update location', error: error.message });
  }
};
