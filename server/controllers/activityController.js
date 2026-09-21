const Activity = require("../models/Activity");

// GET /api/activity — the authenticated user's own activity only (or all,
// for admin). Never every user's activity to everyone.
const getActivities = async (req, res) => {
    try {
        const filter = req.user.role === "admin" ? {} : { userId: req.user._id };
        const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(100);

        res.json({
            success: true,
            count: activities.length,
            activities
        });
    } catch (error) {
        console.error("Get activities error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities"
        });
    }
};

module.exports = {
    getActivities
};
