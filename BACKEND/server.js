const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); 
const { Server } = require('socket.io'); 

const app = express();
const server = http.createServer(app); 

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
    methods: ['GET', 'POST', 'PUT']
  }
});

// Make io accessible inside our controllers
app.set('io', io); 

// Middleware
app.use(express.json());
app.use(cors());

// ==========================================
// API Routes
// ==========================================
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes'); // NEW

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/payments', paymentRoutes); // NEW

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Food Delivery API is running with Real-Time Tracking & Payments...');
});

// ==========================================
// Socket.io Real-Time Connection Logic
// ==========================================
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Customers join a room named after their specific Order ID to track it
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User joined order room: order_${orderId}`);
  });

  // Restaurant owners join a room named after their Restaurant ID to get new orders
  socket.on('joinRestaurantRoom', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Restaurant joined room: restaurant_${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// ==========================================
// Database Connection & Server Start
// ==========================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    server.listen(PORT, () => {
      console.log(`Server & Socket.io running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });