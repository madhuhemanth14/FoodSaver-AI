const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const pickupRoutes = require("./routes/pickupRoutes");
const ngoRoutes = require("./routes/ngoRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/pickups", pickupRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FoodSaver AI API is running",
  });
});

// NGO routes
app.use("/api/ngos", ngoRoutes);

// MongoDB + Server
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `🚀 FoodSaver AI server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
    process.exit(1);
  }
};

startServer();