const Donation = require('../models/Donation');
const Pickup = require('../models/Pickup');
const Notification = require('../models/Notification');

/**
 * Get Donor Dashboard
 * @route GET /api/dashboard/donor
 */
exports.getDonorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalDonations = await Donation.countDocuments({ donor: userId });
    const activeDonations = await Donation.countDocuments({
      donor: userId,
      status: { $in: ['Available', 'Assigned', 'PickupScheduled'] }
    });
    const completedDonations = await Donation.countDocuments({
      donor: userId,
      status: 'Delivered'
    });

    const deliveredDonations = await Donation.find({
      donor: userId,
      status: 'Delivered'
    });

    const foodDonated = deliveredDonations.reduce(
      (sum, d) => sum + (d.quantity || 0),
      0
    );

    const mealsProvided = Math.round(foodDonated * 4);
    const co2Saved = parseFloat((foodDonated * 2.5).toFixed(1));

    const recentDonations = await Donation.find({ donor: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('ngo', 'name shortName');

    const unreadNotifications = await Notification.countDocuments({
      user: userId,
      read: false
    });

    const recentActivity = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalDonations,
          activeDonations,
          completedDonations,
          foodDonated,
          mealsProvided,
          co2Saved
        },
        recentDonations,
        recentActivity,
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Error getting donor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get NGO Dashboard
 * @route GET /api/dashboard/ngo
 */
exports.getNGODashboard = async (req, res) => {
  try {
    const availableDonations = await Donation.countDocuments({
      status: 'Available'
    });

    const recentDonations = await Donation.find({
      status: 'Available'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('donor', 'name');

    const unreadNotifications = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.json({
      success: true,
      data: {
        stats: {
          availableDonations
        },
        recentDonations,
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Error getting NGO dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get Dashboard Stats
 * @route GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    res.status(200).json({
      totalDonations: 99,
      mealsServed: 5000,
      activeDonations: 12,
      pendingPickups: 8,
      co2Saved: 999
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

exports.getDashboardStats = getDashboardStats;