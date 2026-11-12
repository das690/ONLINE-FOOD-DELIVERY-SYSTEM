const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: 'https://fooodexpress.netlify.app/', // Allow frontend dev and preview servers
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach socket.io to express app for access in controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic Security & Request Logger in Dev
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ==========================================
// API Routes
// ==========================================
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'FoodExpress API is running with Socket.io & Payments',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('FoodExpress Delivery System API is running...');
});

// ==========================================
// Socket.io Real-Time Event Handlers
// ==========================================
io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);

  // Customer or Driver joins order room
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order room: order_${orderId}`);
  });

  // Restaurant owner joins their store room
  socket.on('joinRestaurantRoom', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Restaurant owner joined room: restaurant_${restaurantId}`);
  });

  // Driver emits live GPS coordinates
  socket.on('sendDriverLocation', (data) => {
    const { orderId, lat, lng, progressPercent } = data;
    io.to(`order_${orderId}`).emit('locationUpdate', {
      orderId,
      coordinates: { lat, lng, progressPercent }
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// ==========================================
// Global 404 & Error Handler
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// ==========================================
// Database Connection & Server Start
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`MongoDB Connected Successfully to: ${mongoose.connection.name}`);
    server.listen(PORT, () => {
      console.log(`Server & Socket.io running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });
