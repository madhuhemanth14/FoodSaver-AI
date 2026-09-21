const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    // Links this NGO record to the User account that manages it (created
    // automatically at signup for role "ngo" — see authController.register).
    // Optional/sparse because NGOs added directly by an admin (not through
    // self-signup) may not have a linked login yet.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
  },
},
    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    distance: {
      type: Number,
      default: 0,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },

    capacity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
verified: {
  type: Boolean,
  default: false,
},
    acceptedFood: {
      type: [String],
      default: [],
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
ngoSchema.index({
  location: "2dsphere",
});

module.exports = mongoose.model("NGO", ngoSchema);