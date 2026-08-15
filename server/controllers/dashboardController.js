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
            message: "Failed to fetch dashboard stats"
        });
    }
};

module.exports = {
    getDashboardStats
};