// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Check if user is authenticated with a valid JWT
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the token exists in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token (Format is "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the database and attach them to the request object
      // We use .select('-password') to ensure we don't accidentally pass the password hash along
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Move to the next function (the actual route controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @desc    Role-based access control (e.g., restrict to 'restaurant_owner' or 'admin')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the 'protect' middleware before this runs
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };