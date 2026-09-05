const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const sendEmail = require("../services/emailService");
// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};


// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            isRead: false
        });

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error("Get unread count error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch unread notification count"
        });
    }
};


// Mark one notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                isRead: true
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read"
        });
    }
};


// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                isRead: false
            },
            {
                isRead: true
            }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read"
        });
    }
};

// Create a test notification
const createTestNotification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // 1. Create notification in MongoDB
        const notification = await Notification.create({
            userId: new mongoose.Types.ObjectId(),
            type: "system",
            title: "Test Notification",
            message: "Your notification backend is working!",
            isRead: false
        });

        // 2. Send email
        await sendEmail(
            email,
            "FoodSaver AI - Test Notification",
            "Your notification backend is working!"
        );

        // 3. Send response
        res.status(201).json({
            success: true,
            message: "Notification created and email sent successfully",
            notification
        });

    } catch (error) {
        console.error("Create test notification error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create notification or send email",
            error: error.message
        });
    }
};
module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createTestNotification
};