const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    let existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Determine role safely
    let assignedRole = 'customer';
    if (role === 'restaurant_owner') {
      assignedRole = 'restaurant_owner';
    } else if (role === 'admin') {
      if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
        assignedRole = 'admin';
      } else {
        return res.status(403).json({ message: 'Invalid Admin Secret code. Cannot register as admin.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: assignedRole,
      phone: phone || '',
      address: address || '',
      savedAddresses: address ? [{ label: 'Home', street: address, city: 'Local Area', isDefault: true }] : []
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    One-Click Demo Login
// @route   POST /api/auth/demo-login
exports.demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'customer' | 'restaurant_owner' | 'admin'
    const targetRole = ['customer', 'restaurant_owner', 'admin'].includes(role) ? role : 'customer';

    const demoEmails = {
      customer: 'customer.demo@foodexpress.com',
      restaurant_owner: 'owner.demo@foodexpress.com',
      admin: 'admin.demo@foodexpress.com'
    };

    const demoNames = {
      customer: 'Sayan Demo Customer',
      restaurant_owner: 'Chef Marco Owner',
      admin: 'Platform Admin'
    };

    const email = demoEmails[targetRole];
    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Demo@1234', salt);
      user = new User({
        name: demoNames[targetRole],
        email,
        password: hashedPassword,
        role: targetRole,
        phone: '+91 98765 12345',
        address: 'MG Road, Indiranagar, Bangalore',
        savedAddresses: [
          { label: 'Home', street: 'Flat 402, Sunshine Apts, Indiranagar', city: 'Bangalore', state: 'Karnataka', zipCode: '560038', isDefault: true },
          { label: 'Work', street: 'Level 5, Cyber Tech Park, Whitefield', city: 'Bangalore', state: 'Karnataka', zipCode: '560066', isDefault: false }
        ]
      });
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      message: `Demo login as ${targetRole}`,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Demo login failed', error: error.message });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites', 'name imageUrl cuisine rating deliveryTime location');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

// @desc    Update Profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name.trim();
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Add Saved Address
// @route   POST /api/auth/address
exports.addAddress = async (req, res) => {
  try {
    const { label, street, city, state, zipCode, phone, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (!street || !city) {
      return res.status(400).json({ message: 'Street and City are required' });
    }

    if (isDefault) {
      user.savedAddresses.forEach(addr => addr.isDefault = false);
    }

    user.savedAddresses.push({
      label: label || 'Home',
      street,
      city,
      state: state || '',
      zipCode: zipCode || '',
      phone: phone || user.phone || '',
      isDefault: isDefault || user.savedAddresses.length === 0
    });

    await user.save();
    res.status(201).json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add address', error: error.message });
  }
};

// @desc    Delete Address
// @route   DELETE /api/auth/address/:addressId
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses = user.savedAddresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );
    await user.save();
    res.status(200).json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete address', error: error.message });
  }
};

// @desc    Toggle Favorite Restaurant
// @route   POST /api/auth/favorites/:restaurantId
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const restId = req.params.restaurantId;

    const existsIndex = user.favorites.indexOf(restId);
    let isFavorite = false;

    if (existsIndex > -1) {
      user.favorites.splice(existsIndex, 1);
      isFavorite = false;
    } else {
      user.favorites.push(restId);
      isFavorite = true;
    }

    await user.save();
    res.status(200).json({ isFavorite, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update favorites', error: error.message });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
        <h2 style="color: #f97316;">FoodExpress Password Reset</h2>
        <p>You requested a password reset for your FoodExpress account.</p>
        <p>Please click the button below to reset your password. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">If you didn't request this email, please ignore it.</p>
        <p style="color: #888; font-size: 11px;">Direct link: <a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `;

    const emailResult = await sendEmail({
      email: user.email,
      subject: 'FoodExpress - Reset Your Password',
      html: message
    });

    res.status(200).json({
      message: 'Password reset link sent to your email',
      resetToken, // Provided for easy development & testing convenience
      resetUrl,
      emailSent: emailResult.success
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process forgot password', error: error.message });
  }
};

// @desc    Reset Password with Token
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};
