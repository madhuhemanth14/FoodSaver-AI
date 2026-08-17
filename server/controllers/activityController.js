const mongoose = require("mongoose");
const Activity = require("../models/Activity");

const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({
            createdAt: -1
        });

        res.json({
            success: true,
            count: activities.length,
            activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities"
        });
    }
};

const createTestActivity = async (req, res) => {
    try {
        const activity = await Activity.create({
            userId: new mongoose.Types.ObjectId(),
            type: "donation",
            title: "Listed a new donation",
            description: "Vegetable Biryani Trays",
            status: "completed"
        });

        res.status(201).json({
            success: true,
            activity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create activity"
        });
    }
};

module.exports = {
    getActivities,
    createTestActivity
};