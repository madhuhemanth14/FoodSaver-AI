const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const NGO = require('../models/NGO');

/**
 * Get general dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const donorsCount = await User.countDocuments({ role: 'donor' });
    const ngoUsersCount = await User.countDocuments({ role: 'ngo' });

    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: { $in: ['Pending', 'Available', 'Analyzed'] } });
    const completedDonations = await Donation.countDocuments({ status: 'Delivered' });

    const deliveredDonations = await Donation.find({ status: 'Delivered' });
    const foodSaved = deliveredDonations.reduce((sum, d) => sum + (d.quantity || 0), 0);

    const totalNGOs = await NGO.countDocuments();
    const activeNGOs = await NGO.countDocuments({ status: 'Open' });

    const totalPickups = await Pickup.countDocuments();
    const successfulPickups = await Pickup.countDocuments({ status: 'Completed' });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalDonations,
        pendingDonations,
        completedDonations,
        foodSaved,
        activeNGOs,
        successfulPickups
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get recent activity
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }).limit(10).populate('donor', 'name');
    const pickups = await Pickup.find().sort({ createdAt: -1 }).limit(10).populate('ngo', 'name');
    const users = await User.find().sort({ createdAt: -1 }).limit(10);

    const activity = [
      ...donations.map(d => ({ id: d._id, type: 'donation', description: `New donation: ${d.foodName}`, user: d.donor?.name || 'Unknown', timestamp: d.createdAt, status: d.status })),
      ...pickups.map(p => ({ id: p._id, type: 'pickup', description: `Pickup ${p.status}`, user: p.donorName || 'Unknown', timestamp: p.createdAt, status: p.status })),
      ...users.map(u => ({ id: u._id, type: 'user', description: `New user: ${u.name}`, user: u.name, timestamp: u.createdAt, status: u.isActive ? 'Active' : 'Inactive' }))
    ];

    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ success: true, data: activity.slice(0, 20) });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all users with pagination and filtering
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: { users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update user details (admin)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, isVerified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (id === req.user._id.toString() && role && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot remove admin role from yourself' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Toggle user active status
 */
exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (id === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot deactivate yourself' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: { isActive: user.isActive } });
  } catch (error) {
    console.error('Error toggling user active status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Verify NGO
 */
exports.verifyNGO = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid NGO ID' });
    }

    const ngo = await NGO.findById(id);
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });

    ngo.verified = !!verified;
    await ngo.save();

    res.json({ success: true, message: `NGO ${verified ? 'verified' : 'unverified'} successfully`, data: ngo });
  } catch (error) {
    console.error('Error verifying NGO:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all donations (Admin)
 */
exports.getAllDonationsAdmin = async (req, res) => {
  try {
    const { status, donor, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (donor) query.donor = donor;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const donations = await Donation.find(query).populate('donor', 'name email').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: { donations, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error getting all donations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get all pickups (Admin)
 */
exports.getAllPickupsAdmin = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pickups = await Pickup.find(query).populate('ngo', 'name').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await Pickup.countDocuments(query);

    res.json({
      success: true,
      data: { pickups, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error getting all pickups:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get Analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyDonations = await Donation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
        foodSaved: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, '$quantity', 0] } }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statusDistribution = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topNGOs = await Pickup.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$ngo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: { monthlyDonations, statusDistribution, topNGOs }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get Reports
 */
exports.getReports = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthDonations = await Donation.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const lastMonthDonations = await Donation.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });

    const thisMonthPickups = await Pickup.countDocuments({ createdAt: { $gte: startOfThisMonth }, status: 'Completed' });
    const lastMonthPickups = await Pickup.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }, status: 'Completed' });

    const thisMonthUsers = await User.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });

    res.json({
      success: true,
      data: {
        donations: { thisMonth: thisMonthDonations, lastMonth: lastMonthDonations },
        completedPickups: { thisMonth: thisMonthPickups, lastMonth: lastMonthPickups },
        newUsers: { thisMonth: thisMonthUsers, lastMonth: lastMonthUsers }
      }
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
