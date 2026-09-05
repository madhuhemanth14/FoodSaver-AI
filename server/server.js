const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const donationRoutes = require("./routes/donationRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// --------------- Security & Logging Middleware ---------------
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------- Health Check ---------------
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FoodSaver AI API is running",
    timestamp: new Date().toISOString(),
  });
});

// --------------- API Routes ---------------
app.use("/api/auth", authRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

// --------------- Error Handler (must be last) ---------------
app.use(errorHandler);

// --------------- Server Startup ---------------
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`FoodSaver AI server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();