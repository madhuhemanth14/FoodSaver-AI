const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Generate a JSON Web Token
 * @param {string} userId - The user ID to encode in the token
 * @returns {string} The JWT token
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // Validate required fields
    if (!name || name.length < 2 || name.length > 50) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 50 characters' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!role || !['donor', 'ngo'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be donor or ngo' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role,
      address
    });
    
    await user.save();

    // Create a welcome notification
    const notification = new Notification({
      user: user._id,
      title: 'Welcome to FoodSaver AI!',
      message: `Hello ${user.name}, thank you for joining our platform to help reduce food waste.`,
      type: 'system',
      isRead: false
    });
    await notification.save();

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

/**
 * Change user password
 * @route PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Find user to get the hashed password
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // pre-save hook will hash the new password

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    return res.status(500).json({ success: false, message: 'Server error changing password' });
  }
};
