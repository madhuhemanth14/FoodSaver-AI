const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    // Optional link to a registered user; donations can still be created
    // with just contact details, matching how Pickup already works.
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    donorName: {
      type: String,
      required: true,
      trim: true,
    },

    donorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    donorPhone: {
      type: String,
      trim: true,
      default: "",
    },

    foodItems: {
      type: [String],
      required: true,
      default: [],
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    quantityUnit: {
      type: String,
      enum: ["kg", "litres", "packets", "items"],
      default: "kg",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    preparationDate: {
      type: Date,
    },

    // Predicted/declared expiry date-time. Drives the reminder scheduler.
    expiryDate: {
      type: Date,
    },

    // ---- AI analysis result (populated from the existing AI analysis
    // flow's actual output — never fabricated here) ----
    aiAnalysis: {
      foodType: { type: String, default: "" },
      freshness: { type: String, default: "" },
      confidence: { type: Number, default: null },
      recommendation: { type: String, default: "" },
      analyzedAt: { type: Date, default: null },
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Assigned",
        "Picked Up",
        "Completed",
        "Cancelled",
        "Expired",
      ],
      default: "Available",
    },

    // Optional link once a Pickup is created against this donation
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickup",
      default: null,
    },

    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      default: null,
    },

    // ---- Email tracking (most recent email attempt), same shape as Pickup ----
    emailStatus: {
      type: String,
      enum: ["Pending", "Sending", "Sent", "Failed"],
      default: "Pending",
    },
    emailType: {
      type: String,
      default: "",
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailError: {
      type: String,
      default: "",
    },

    // ---- Expiry reminder / expired-admin-alert duplicate prevention ----
    expiryReminderSent: {
      type: Boolean,
      default: false,
    },
    expiryReminderSentAt: {
      type: Date,
      default: null,
    },
    expiryAdminEmailSent: {
      type: Boolean,
      default: false,
    },
    expiryAdminEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);
