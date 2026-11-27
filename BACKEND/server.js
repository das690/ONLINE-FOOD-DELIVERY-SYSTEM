const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// ==========================================
// Environment-aware CORS origins
// ==========================================
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://fooodexpress.netlify.app'
].filter(Boolean);

// Initialize Socket.io with unified CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach socket.io to express app for access in controllers
app.set('io', io);

// Trust proxy for rate limiting behind Render/Heroku/Nginx
app.set('trust proxy', 1);

// ==========================================
// Security & Middleware
// ==========================================
// Helmet for secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allow inline scripts for Razorpay
}));

// CORS - unified with socket.io config
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Global rate limiter — 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Express 5-safe NoSQL injection sanitizer for req.body & req.params
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
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

  // Leave order room
  socket.on('leaveOrderRoom', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`Socket ${socket.id} left order room: order_${orderId}`);
  });

  // Leave restaurant room
  socket.on('leaveRestaurantRoom', (restaurantId) => {
    socket.leave(`restaurant_${restaurantId}`);
    console.log(`Socket ${socket.id} left restaurant room: restaurant_${restaurantId}`);
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
    process.exit(1);
  });

module.exports = { app, server };
