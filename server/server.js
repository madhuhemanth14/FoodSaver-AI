const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Fail fast (and safely) on missing required secrets instead of silently
// falling back to insecure defaults. Never print secret values.
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missingEnv.join(", ")}. ` +
      "Copy server/.env.example to server/.env and fill in real values."
  );
  process.exit(1);
}
console.log(
  `Email sending: ${process.env.EMAIL_USER && process.env.EMAIL_PASS ? "configured" : "NOT configured"}`
);

const connectDB = require("./config/db");
const { startExpiryScheduler } = require("./services/expiryScheduler");

const dashboardRoutes = require("./routes/dashboardRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const emailRoutes = require("./routes/emailRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FoodSaver AI API is running",
  });
});

app.use("/api/ngos", ngoRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

const startServer = async () => {
  try {
    await connectDB();

    // Background job for expiry reminders / expired-admin alerts.
    // Wrapped so a scheduler failure never crashes the server.
    try {
      startExpiryScheduler();
    } catch (schedulerError) {
      console.error("Failed to start expiry scheduler:", schedulerError);
    }

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