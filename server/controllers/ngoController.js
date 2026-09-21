const NGO = require("../models/NGO");
const mongoose = require("mongoose");
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");

async function findOrProvisionMyNGO(user) {
  let ngo = await NGO.findOne({ user: user._id });

  if (!ngo && user.email) {
    ngo = await NGO.findOne({ email: user.email.toLowerCase() });
    if (ngo && !ngo.user) {
      ngo.user = user._id;
      await ngo.save();
    }
  }

  if (!ngo) {
    ngo = await NGO.create({
      user: user._id,
      name: user.name || "My NGO",
      shortName: (user.name || "My NGO").slice(0, 40),
      address: user.address || "Not set yet",
      city: "Not set",
      state: "Not set",
      phone: user.phone || "Not set",
      email: user.email || "",
      latitude: 0,
      longitude: 0,
      location: { type: "Point", coordinates: [0, 0] },
      status: "Closed",
      verified: false,
      acceptedFood: [],
    });
  }

  return ngo;
}

// GET /api/ngos/me — the authenticated NGO user's own organization record.
const getMyNGO = async (req, res) => {
  try {
    const ngo = await findOrProvisionMyNGO(req.user);
    res.json({ success: true, data: ngo });
  } catch (error) {
    console.error("Get my NGO error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch NGO profile" });
  }
};

// PATCH /api/ngos/me — real, backend-validated NGO profile editing.
const NGO_EDITABLE_FIELDS = [
  "name",
  "shortName",
  "address",
  "city",
  "state",
  "phone",
  "email",
  "status",
  "capacity",
  "acceptedFood",
  "latitude",
  "longitude",
];
const updateMyNGO = async (req, res) => {
  try {
    const updates = {};
    for (const field of NGO_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      updates.location = {
        type: "Point",
        coordinates: [Number(updates.longitude), Number(updates.latitude)],
      };
    }

    const ngo = await NGO.findOneAndUpdate({ user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });
    if (!ngo) {
      return res.status(404).json({ success: false, message: "No NGO profile found for this account" });
    }
    res.json({ success: true, message: "NGO profile updated", data: ngo });
  } catch (error) {
    console.error("Update my NGO error:", error);
    res.status(500).json({ success: false, message: "Failed to update NGO profile" });
  }
};

// GET /api/ngos/dashboard — real, per-NGO operational overview. No mock
// data: everything below is a genuine MongoDB query scoped to this NGO.
const getNgoDashboard = async (req, res) => {
  try {
    const myNgo = await NGO.findOne({ user: req.user._id });
    if (!myNgo) {
      return res.status(404).json({ success: false, message: "No NGO profile found for this account" });
    }

    const [
      availableDonations,
      assignedDonations,
      upcomingPickups,
      completedPickupsCount,
      foodReceivedAgg,
    ] = await Promise.all([
      Donation.find({ status: "Available" }).sort({ createdAt: -1 }).limit(30),
      Donation.find({ ngo: myNgo._id, status: { $in: ["Assigned", "Picked Up"] } })
        .sort({ createdAt: -1 })
        .limit(30),
      Pickup.find({ ngo: myNgo._id, status: { $in: ["Pending", "Confirmed"] } })
        .sort({ pickupDate: 1 })
        .limit(30),
      Pickup.countDocuments({ ngo: myNgo._id, status: "Completed" }),
      Donation.aggregate([
        { $match: { ngo: myNgo._id, status: "Completed" } },
        { $group: { _id: null, totalKg: { $sum: "$quantity" } } },
      ]),
    ]);

    res.json({
      success: true,
      ngo: myNgo,
      stats: {
        availableDonations: availableDonations.length,
        assignedDonations: assignedDonations.length,
        upcomingPickups: upcomingPickups.length,
        completedPickups: completedPickupsCount,
        foodReceived: foodReceivedAgg[0]?.totalKg || 0,
      },
      availableDonations,
      assignedDonations,
      upcomingPickups,
    });
  } catch (error) {
    console.error("NGO dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load NGO dashboard" });
  }
};

// CREATE NGO (admin only — see routes)
const createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create(req.body);

    res.status(201).json({
      success: true,
      message: "NGO created successfully",
      data: ngo,
    });
  } catch (error) {
    console.error("Create NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create NGO",
      error: error.message,
    });
  }
};

// GET ALL NGOs
const getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find();

    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    console.error("Get NGOs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch NGOs",
      error: error.message,
    });
  }
};
const getNearbyNGOs = async (req, res) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    const radius = Number(req.query.radius || 10);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const ngos = await NGO.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000,
        },
      },
    });

    res.json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    console.error("Nearby NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to find nearby NGOs",
      error: error.message,
    });
  }
};
// GET SINGLE NGO
const getNGOById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NGO.findById(id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ngo,
    });
  } catch (error) {
    console.error("Get NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch NGO",
      error: error.message,
    });
  }
};

// UPDATE NGO (admin, or the NGO's own linked user — see routes)
const updateNGO = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const existing = await NGO.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }
    const isOwner = existing.user && existing.user.equals(req.user._id);
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ success: false, message: "You do not have access to this NGO" });
    }

    const ngo = await NGO.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "NGO updated successfully",
      data: ngo,
    });
  } catch (error) {
    console.error("Update NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update NGO",
      error: error.message,
    });
  }
};

// DELETE NGO
const deleteNGO = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NGO.findByIdAndDelete(id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "NGO deleted successfully",
    });
  } catch (error) {
    console.error("Delete NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete NGO",
      error: error.message,
    });
  }
};
const searchNGOs = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";

    const ngos = await NGO.find({
      $or: [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          address: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          city: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          state: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          acceptedFood: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    console.error("Search NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search NGOs",
      error: error.message,
    });
  }
};
module.exports = {
  createNGO,
  getNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  searchNGOs,
  getNearbyNGOs,
  getMyNGO,
  updateMyNGO,
  getNgoDashboard,
};

 