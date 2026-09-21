const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const Activity = require("../models/Activity");

// Real, per-user dashboard stats derived from MongoDB. No hardcoded
// numbers: every field below is a genuine count/aggregate scoped to the
// authenticated user's role. Donor: their own donations/pickups. Admin:
// platform-wide. NGO scoping is limited by the same NGO-account/User-link
// gap documented in donationController (Phase 2 TODO).
const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user.role === "admin";
        const donationFilter = isAdmin ? {} : { donor: user._id };
        const pickupFilter = isAdmin ? {} : { donorEmail: user.email };

        const [
            activeDonations,
            completedDonations,
            upcomingPickupsCount,
            foodSavedAgg,
        ] = await Promise.all([
            Donation.countDocuments({ ...donationFilter, status: { $in: ["Available", "Assigned"] } }),
            Donation.countDocuments({ ...donationFilter, status: "Completed" }),
            Pickup.countDocuments({ ...pickupFilter, status: { $in: ["Pending", "Confirmed"] }, pickupDate: { $gte: new Date() } }),
            Donation.aggregate([
                { $match: { ...donationFilter, status: "Completed" } },
                { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
            ]),
        ]);

        const foodSaved = foodSavedAgg[0]?.totalKg || 0;

        res.status(200).json({
            success: true,
            stats: {
                activeDonations,
                upcomingPickups: upcomingPickupsCount,
                completedDonations,
                foodSaved,
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats"
        });
    }
};

// GET /api/dashboard/overview — active donations, upcoming pickups, and
// recent activity for the authenticated user, all read from MongoDB.
const getDashboardOverview = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user.role === "admin";
        const donationFilter = isAdmin ? {} : { donor: user._id };
        const pickupFilter = isAdmin ? {} : { donorEmail: user.email };
        const activityFilter = isAdmin ? {} : { userId: user._id };

        const [activeDonations, upcomingPickups, recentActivity] = await Promise.all([
            Donation.find({ ...donationFilter, status: { $in: ["Available", "Assigned"] } })
                .sort({ createdAt: -1 })
                .limit(20),
            Pickup.find({ ...pickupFilter, pickupDate: { $gte: new Date() } })
                .populate("ngo", "name shortName address phone")
                .sort({ pickupDate: 1 })
                .limit(20),
            Activity.find(activityFilter).sort({ createdAt: -1 }).limit(20),
        ]);

        res.status(200).json({
            success: true,
            activeDonations,
            upcomingPickups,
            recentActivity,
        });
    } catch (error) {
        console.error("Dashboard overview error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard overview"
        });
    }
};

module.exports = {
    getDashboardStats,
    getDashboardOverview
};
