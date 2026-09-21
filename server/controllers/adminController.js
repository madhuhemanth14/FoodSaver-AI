const User = require("../models/User");
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const NGO = require("../models/NGO");

// GET /api/admin/dashboard — real, platform-wide MongoDB aggregates.
// NOTE: this schema has no login/session tracking, so "activeUsers" is
// defined as non-admin accounts (donors + NGOs) rather than a fabricated
// "logged in recently" metric — documented here rather than silently
// mislabeled.
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDonations,
      pendingDonations,
      completedDonations,
      foodSavedAgg,
      activeNGOs,
      verifiedNGOs,
      successfulPickups,
      pendingPickups,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $ne: "admin" } }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: { $in: ["Available", "Assigned"] } }),
      Donation.countDocuments({ status: "Completed" }),
      Donation.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
      ]),
      NGO.countDocuments({ status: "Open" }),
      NGO.countDocuments({ verified: true }),
      Pickup.countDocuments({ status: "Completed" }),
      Pickup.countDocuments({ status: { $in: ["Pending", "Confirmed"] } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalDonations,
        pendingDonations,
        completedDonations,
        foodSaved: foodSavedAgg[0]?.totalKg || 0,
        activeNGOs,
        verifiedNGOs,
        successfulPickups,
        pendingPickups,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load admin dashboard" });
  }
};

// GET /api/admin/activity — a real, unified, platform-wide feed built from
// the most recent donations/pickups/users/NGOs. No mock rows.
const getActivity = async (req, res) => {
  try {
    const limit = 8;
    const [donations, pickups, users, ngos] = await Promise.all([
      Donation.find().sort({ createdAt: -1 }).limit(limit).select("foodItems donorName status createdAt"),
      Pickup.find().sort({ createdAt: -1 }).limit(limit).select("donorName status createdAt"),
      User.find().sort({ createdAt: -1 }).limit(limit).select("name email role createdAt"),
      NGO.find().sort({ createdAt: -1 }).limit(limit).select("name status createdAt"),
    ]);

    const feed = [
      ...donations.map((d) => ({
        id: `donation-${d._id}`,
        type: "DONATION",
        message: `${d.donorName} listed ${d.foodItems.join(", ")} (${d.status})`,
        createdAt: d.createdAt,
      })),
      ...pickups.map((p) => ({
        id: `pickup-${p._id}`,
        type: "PICKUP",
        message: `Pickup for ${p.donorName} is ${p.status}`,
        createdAt: p.createdAt,
      })),
      ...users.map((u) => ({
        id: `user-${u._id}`,
        type: "USER",
        message: `New ${u.role} account created: ${u.email}`,
        createdAt: u.createdAt,
      })),
      ...ngos.map((n) => ({
        id: `ngo-${n._id}`,
        type: "NGO",
        message: `${n.name} registered (${n.status})`,
        createdAt: n.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    res.json({ success: true, activities: feed });
  } catch (error) {
    console.error("Admin activity error:", error);
    res.status(500).json({ success: false, message: "Failed to load admin activity" });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load user" });
  }
};

// PATCH /api/admin/users/:id/status — real block/unblock, persisted on the
// User schema (adds User.isBlocked rather than inventing a fake status).
const updateUserStatus = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ success: false, message: "isBlocked (boolean) is required" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: `User ${isBlocked ? "blocked" : "unblocked"}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

// GET /api/admin/ngos
const getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, count: ngos.length, data: ngos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load NGOs" });
  }
};

// PATCH /api/admin/ngos/:id/status — verify/reject/open/close an NGO.
const updateNGOStatus = async (req, res) => {
  try {
    const updates = {};
    if (req.body.verified !== undefined) updates.verified = Boolean(req.body.verified);
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "verified and/or status is required" });
    }
    const ngo = await NGO.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!ngo) return res.status(404).json({ success: false, message: "NGO not found" });
    res.json({ success: true, message: "NGO updated", data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update NGO" });
  }
};

// GET /api/admin/donations
const getDonations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const donations = await Donation.find(filter)
      .populate("ngo", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load donations" });
  }
};

// GET /api/admin/analytics?range=7d|30d|90d|12m
const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };
const getAnalytics = async (req, res) => {
  try {
    const days = RANGE_DAYS[req.query.range] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [donationsOverTime, statusDistribution, categoryDistribution] = await Promise.all([
      Donation.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Donation.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const hasData = donationsOverTime.length > 0;

    res.json({
      success: true,
      range: req.query.range || "30d",
      hasData,
      message: hasData ? undefined : "Not enough data for this period.",
      donationsOverTime: donationsOverTime.map((d) => ({ label: d._id, value: d.count })),
      statusDistribution: statusDistribution.map((d) => ({ label: d._id, value: d.count })),
      categoryDistribution: categoryDistribution.map((d) => ({ label: d._id || "Other", value: d.count })),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics" });
  }
};

// GET /api/admin/reports — real summary counts; CSV export handled by
// having the client convert `data` (no separate fabricated export format).
const getReports = async (req, res) => {
  try {
    const [totalDonations, totalPickups, totalUsers, totalNgos, foodSavedAgg] = await Promise.all([
      Donation.countDocuments(),
      Pickup.countDocuments(),
      User.countDocuments(),
      NGO.countDocuments(),
      Donation.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
      ]),
    ]);
    res.json({
      success: true,
      summary: {
        totalDonations,
        totalPickups,
        totalUsers,
        totalNgos,
        foodSaved: foodSavedAgg[0]?.totalKg || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};

module.exports = {
  getDashboard,
  getActivity,
  getUsers,
  getUserById,
  updateUserStatus,
  getNGOs,
  updateNGOStatus,
  getDonations,
  getAnalytics,
  getReports,
};
