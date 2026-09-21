const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },

    // Back-reference to the donation this pickup was created for, when
    // created via the donation flow (kept in sync with Donation.pickup so
    // status changes here can propagate back to the donation).
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
    },

    // The authenticated donor who requested this pickup. Always set
    // server-side from req.user — never trusted from client input.
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    donorName: {
      type: String,
      required: true,
      trim: true,
    },

    donorPhone: {
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
    foodItems: {
      type: [String],
      required: true,
      default: [],
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    quantityUnit: {
      type: String,
      enum: ["kg", "litres", "packets", "items"],
      default: "kg",
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Picked Up",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    // ---- Email tracking (per-pickup, most recent email attempt) ----
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

    // Prevents re-sending the "assigned to NGO" email on later, unrelated updates
    ngoAssignmentEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pickup", pickupSchema);