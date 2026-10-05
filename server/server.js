const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const notificationRoutes = require("./routes/notificationRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const emailRoutes = require("./routes/emailRoutes");

const ngoRoutes = require("./routes/ngoRoutes");
const pickupRoutes = require("./routes/pickupRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Module 5 - Dashboard / Notifications / Email
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/email", emailRoutes);

// Module 3 - NGO
app.use("/api/ngos", ngoRoutes);

// Module 4 - Pickup
app.use("/api/pickups", pickupRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FoodSaver AI API is running"
    });
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `FoodSaver AI server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();