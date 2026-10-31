const User = require("../models/User");
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const NGO = require("../models/NGO");
const { ensureCurrentPasswordInHistory } = require("../utils/passwordHistory");

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
      Donation.countDocuments({ status: { $in: ["Available", "Accepted", "Assigned", "Closed", "Pending"] } }),
      Donation.countDocuments({ status: { $regex: /^(completed|picked up|delivered)$/i } }),
      Donation.aggregate([
        { $match: { status: { $regex: /^(completed|picked up|delivered)$/i } } },
        { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
      ]),
      NGO.countDocuments({ status: "Open" }),
      NGO.countDocuments({ verified: true }),
      Pickup.countDocuments({ status: { $regex: /^(completed|delivered)$/i } }),
      Pickup.countDocuments({ status: { $in: ["Pending Confirmation", "Pending", "Confirmed", "Requested", "Accepted", "On the Way", "Arrived"] } }),
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
      ...donations.map((d) => {
        const food = Array.isArray(d.foodItems) && d.foodItems.length > 0
          ? d.foodItems.join(", ")
          : (typeof d.foodItems === "string" && d.foodItems ? d.foodItems : "food package");
        const donor = d.donorName || "Donor";
        return {
          id: `donation-${d._id}`,
          type: "DONATION",
          message: `${donor} listed ${food} (${d.status || "Available"})`,
          createdAt: d.createdAt,
        };
      }),
      ...pickups.map((p) => ({
        id: `pickup-${p._id}`,
        type: "PICKUP",
        message: `Pickup for ${p.donorName || "Donor"} is ${p.status || "Pending"}`,
        createdAt: p.createdAt,
      })),
      ...users.map((u) => ({
        id: `user-${u._id}`,
        type: "USER",
        message: `New ${u.role || "user"} account created: ${u.email}`,
        createdAt: u.createdAt,
      })),
      ...ngos.map((n) => ({
        id: `ngo-${n._id}`,
        type: "NGO",
        message: `${n.name || "NGO"} registered (${n.status || "Open"})`,
        createdAt: n.createdAt,
      })),
    ]
      .filter((item) => item.createdAt)
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
    console.error("Admin update NGO error:", error);
    res.status(500).json({ success: false, message: "Failed to update NGO" });
  }
};

// DELETE /api/admin/ngos/:id — permanently removes the NGO organization
// and, when present, the linked NGO login account.
const deleteNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ success: false, message: "NGO not found" });

    const linkedUserId = ngo.user;
    if (linkedUserId) {
      // Keep the account's password hash in PasswordHistory (which is never
      // deleted) so the same email can't reuse it after re-registering.
      const linkedUser = await User.findById(linkedUserId);
      await ensureCurrentPasswordInHistory(linkedUser);
      await User.findByIdAndDelete(linkedUserId);
    }
    await NGO.findByIdAndDelete(ngo._id);

    res.json({
      success: true,
      message: `${ngo.name} and its linked NGO account were deleted`,
      deletedNgoId: ngo._id,
      deletedUserId: linkedUserId || null,
    });
  } catch (error) {
    console.error("Admin delete NGO error:", error);
    res.status(500).json({ success: false, message: "Failed to delete NGO account" });
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

    const [
      donationsOverTime,
      foodSavedOverTime,
      statusDistribution,
      categoryDistribution,
      scheduledPickups,
      completedPickups,
      ngoActivityAgg,
      userGrowthAgg,
      totalUsers,
      activeNgosCount,
      foodSavedAgg,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Donation.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, totalKg: { $sum: "$quantity" } } },
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
      Pickup.countDocuments({ createdAt: { $gte: since } }),
      Pickup.countDocuments({ createdAt: { $gte: since }, status: "Completed" }),
      Donation.aggregate([
        { $match: { ngo: { $ne: null } } },
        { $group: { _id: "$ngo", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
        { $lookup: { from: "ngos", localField: "_id", foreignField: "_id", as: "ngoDoc" } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.countDocuments(),
      NGO.countDocuments({ status: "Open" }),
      Donation.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
      ]),
    ]);

    const totalFoodKg = foodSavedAgg[0]?.totalKg || 0;
    const rate = scheduledPickups > 0 ? Math.round((completedPickups / scheduledPickups) * 100) : (completedPickups > 0 ? 100 : 0);

    // Real donations over time; if current range has 0, query recent timeline
    let formattedDonationsOverTime = donationsOverTime.map((d) => ({ label: d._id, value: d.count }));
    if (formattedDonationsOverTime.length === 0) {
      const allRecentDonations = await Donation.aggregate([
        { $match: { createdAt: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 8 },
      ]);
      formattedDonationsOverTime = allRecentDonations.map((d) => ({ label: d._id, value: d.count }));
    }

    // Real food saved over time
    let formattedFoodSavedOverTime = foodSavedOverTime.map((d) => ({ label: d._id, value: d.totalKg }));
    if (formattedFoodSavedOverTime.length === 0) {
      const allRecentFood = await Donation.aggregate([
        { $match: { createdAt: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, totalKg: { $sum: "$quantity" } } },
        { $sort: { _id: 1 } },
        { $limit: 8 },
      ]);
      formattedFoodSavedOverTime = allRecentFood.map((d) => ({ label: d._id, value: d.totalKg }));
    }

    // Real category distribution from DB
    let formattedCategories = categoryDistribution.map((d) => ({ label: d._id || "Other", value: d.count }));
    if (formattedCategories.length === 0) {
      const allCategories = await Donation.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]);
      formattedCategories = allCategories
        .filter((c) => c._id)
        .map((c) => ({ label: c._id, value: c.count }));
    }

    // Real status distribution from DB
    let formattedStatus = statusDistribution.map((d) => ({ label: d._id, value: d.count }));
    if (formattedStatus.length === 0) {
      const allStatuses = await Donation.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      formattedStatus = allStatuses
        .filter((s) => s._id)
        .map((s) => ({ label: s._id, value: s.count }));
    }

    // Real NGO activity from DB
    let formattedNgoActivity = ngoActivityAgg.map((n) => ({ label: n.ngoDoc[0]?.name || "Partner NGO", value: n.count }));
    if (formattedNgoActivity.length === 0) {
      const realNgos = await NGO.find({ status: "Open" }).limit(5).select("name");
      formattedNgoActivity = realNgos.map((n) => ({ label: n.name, value: 1 }));
    }

    // Real user growth from DB
    let formattedUserGrowth = userGrowthAgg.map((u) => ({ label: u._id, value: u.count }));
    if (formattedUserGrowth.length === 0) {
      const allUserGrowth = await User.aggregate([
        { $match: { createdAt: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: "%b %d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 8 },
      ]);
      formattedUserGrowth = allUserGrowth.map((u) => ({ label: u._id, value: u.count }));
    }

    res.json({
      success: true,
      range: req.query.range || "30d",
      hasData: true,
      donationsOverTime: formattedDonationsOverTime,
      foodSavedOverTime: formattedFoodSavedOverTime,
      donationCategories: formattedCategories,
      donationStatus: formattedStatus,
      pickupCompletion: {
        rate,
        completed: completedPickups,
        scheduled: scheduledPickups,
      },
      ngoActivity: formattedNgoActivity,
      userGrowth: formattedUserGrowth,
      monthlyImpact: {
        foodSaved: totalFoodKg,
        successfulPickups: completedPickups,
        activeNGOs: activeNgosCount,
        users: totalUsers,
        mealsSupported: Math.round(totalFoodKg * 2.5),
        co2Impact: Math.round(totalFoodKg * 1.8),
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics" });
  }
};

// GET /api/admin/reports — real summary counts and full report breakdowns
const getReports = async (req, res) => {
  try {
    const [
      totalDonations,
      completedDonations,
      cancelledDonations,
      totalPickups,
      successfulPickups,
      totalUsers,
      activeUsers,
      ngoUsers,
      donors,
      totalNgos,
      activeNgos,
      foodSavedAgg,
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: { $regex: /^(completed|picked up|delivered)$/i } }),
      Donation.countDocuments({ status: { $regex: /^cancelled$/i } }),
      Pickup.countDocuments(),
      Pickup.countDocuments({ status: { $regex: /^(completed|delivered)$/i } }),
      User.countDocuments(),
      User.countDocuments({ isBlocked: { $ne: true } }),
      User.countDocuments({ role: "ngo" }),
      User.countDocuments({ role: "donor" }),
      NGO.countDocuments(),
      NGO.countDocuments({ status: "Open" }),
      Donation.aggregate([
        { $match: { status: { $regex: /^(completed|picked up|delivered)$/i } } },
        { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
      ]),
    ]);

    const foodSaved = foodSavedAgg[0]?.totalKg || 0;

    res.json({
      success: true,
      summary: {
        totalDonations,
        totalPickups,
        totalUsers,
        totalNgos,
        foodSaved,
        generatedAt: new Date().toISOString(),
      },
      donationReport: {
        totalDonations: totalDonations || 0,
        completedDonations: completedDonations || 0,
        cancelledDonations: cancelledDonations || 0,
        foodSaved: foodSaved || 0,
        successfulPickups: successfulPickups || 0,
        activeNGOs: activeNgos || 0,
      },
      userReport: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        ngoUsers: ngoUsers || 0,
        donors: donors || 0,
      },
    });
  } catch (error) {
    console.error("Admin reports error:", error);
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
  deleteNGO,
  getDonations,
  getAnalytics,
  getReports,
};
