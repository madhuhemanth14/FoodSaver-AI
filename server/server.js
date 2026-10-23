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

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>FoodSaver AI API</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f6f8f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); padding: 40px; max-width: 500px; text-align: center; border: 1px solid #e2ebe2; }
        h1 { color: #2e7d32; font-size: 24px; margin: 0 0 10px; }
        p { color: #5f6f61; font-size: 15px; line-height: 1.6; margin: 0 0 25px; }
        .badge { display: inline-block; background: #eaf6ea; color: #2e7d32; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 999px; margin-bottom: 20px; }
        a.btn { display: inline-block; background: #2e7d32; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; transition: background 0.2s ease; }
        a.btn:hover { background: #1b5e20; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● API Active & Connected</span>
        <h1>FoodSaver AI Backend</h1>
        <p>This is the backend API service for FoodSaver AI. To explore the live application, visit the frontend on Vercel.</p>
        <a class="btn" href="https://foodsaver-ai-theta.vercel.app">Go to FoodSaver AI Website &rarr;</a>
      </div>
    </body>
    </html>
  `);
});

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

    // Pickups created before the donor-confirmation workflow used "Pending".
    try {
      await require("./models/Pickup").updateMany(
        { status: "Pending" },
        { $set: { status: "Pending Confirmation" } }
      );
    } catch (migrationError) {
      console.error("Pickup status migration failed:", migrationError.message);
    }

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