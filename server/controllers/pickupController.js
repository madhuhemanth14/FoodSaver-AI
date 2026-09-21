const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const NGO = require("../models/NGO");
const sendEmail = require("../services/emailService");
const { sendAndTrack } = require("../utils/emailTrack");
const {
  newPickupAdminTemplate,
  ngoPickupAssignedTemplate,
  pickupConfirmedTemplate,
  foodCollectedTemplate,
  pickupCompletedTemplate,
  pickupCancelledTemplate,
} = require("../services/emailTemplates");

const NGO_POPULATE_FIELDS = "name shortName address phone email";

function pickupEmailData(pickup) {
  return {
    pickupId: pickup._id,
    donorName: pickup.donorName,
    donorEmail: pickup.donorEmail,
    donorPhone: pickup.donorPhone,
    ngoName: pickup.ngo?.name || pickup.ngo?.shortName || "Not specified",
    ngoPhone: pickup.ngo?.phone,
    foodItems: pickup.foodItems.join(", "),
    quantity: `${pickup.quantity} ${pickup.quantityUnit}`,
    pickupDate: pickup.pickupDate?.toLocaleDateString?.() || pickup.pickupDate,
    pickupTime: pickup.pickupTime,
    address: pickup.address,
    notes: pickup.notes,
    status: pickup.status,
  };
}

// CREATE PICKUP
//
// Root cause of the old "donorEmail is required" bug: this used to do
// `Pickup.create(req.body)`, trusting the client to send donorName/
// donorEmail/donorPhone/ngo directly. When the frontend didn't send
// donorEmail, Mongoose validation failed. The real fix isn't relaxing the
// schema — it's never trusting the client for donor identity in the first
// place. Donor details now always come from the authenticated user
// (req.user), and the NGO/food/quantity come from a donation the donor
// actually owns, verified server-side.
const createPickup = async (req, res) => {
  try {
    const {
      donationId,
      ngo: ngoIdFromBody,
      pickupDate,
      pickupTime,
      address,
      notes,
      donorName: donorNameFromBody,
      donorPhone: donorPhoneFromBody,
      donorEmail: donorEmailFromBody,
    } = req.body;

    if (!pickupDate || !pickupTime) {
      return res.status(400).json({ success: false, message: "Pickup date and time are required" });
    }

    const isNgoRequester = req.user.role === "ngo";

    let foodItems;
    let quantity;
    let quantityUnit;
    let ngoId = ngoIdFromBody;
    let donation = null;

    if (isNgoRequester) {
      const myNgo = await NGO.findOne({ user: req.user._id });
      if (!myNgo) {
        return res.status(404).json({
          success: false,
          message: "No NGO profile is linked to this account. Complete your NGO profile first.",
        });
      }
      ngoId = myNgo._id;

      if (donationId) {
        return res.status(400).json({
          success: false,
          message: "An NGO cannot create a pickup from a donor-owned donation.",
        });
      }

      ({ foodItems, quantity, quantityUnit } = req.body);

      if (!donorNameFromBody || !donorPhoneFromBody || !donorEmailFromBody) {
        return res.status(400).json({
          success: false,
          message: "Donor name, phone and email are required when an NGO schedules a pickup.",
        });
      }
    }

    if (donationId) {
      if (!mongoose.Types.ObjectId.isValid(donationId)) {
        return res.status(400).json({ success: false, message: "Invalid donation ID" });
      }
      donation = await Donation.findById(donationId);
      if (!donation) {
        return res.status(404).json({ success: false, message: "Donation not found" });
      }
      if (!donation.donor || !donation.donor.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: "You do not own this donation" });
      }
      if (!["Available", "Assigned"].includes(donation.status)) {
        return res
          .status(409)
          .json({ success: false, message: `Donation is already ${donation.status.toLowerCase()}` });
      }
      if (donation.pickup) {
        return res.status(409).json({ success: false, message: "A pickup already exists for this donation" });
      }
      foodItems = donation.foodItems;
      quantity = donation.quantity;
      quantityUnit = donation.quantityUnit;
      ngoId = ngoId || donation.ngo;
    } else {
      // Legacy direct-pickup path (no linked donation). Still requires the
      // caller to supply what a donation would have provided, but donor
      // identity is still never taken from the client.
      ({ foodItems, quantity, quantityUnit } = req.body);
    }

    if (!ngoId || !mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ success: false, message: "A valid NGO is required" });
    }
    if (!foodItems || !foodItems.length) {
      return res.status(400).json({ success: false, message: "Food items are required" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "A valid quantity is required" });
    }
    if (!address && !req.user.address) {
      return res.status(400).json({ success: false, message: "A pickup address is required" });
    }

    const pickup = await Pickup.create({
      ngo: ngoId,
      donation: donation ? donation._id : null,
      donor: isNgoRequester ? null : req.user._id,
      donorName: isNgoRequester ? donorNameFromBody : req.user.name,
      donorEmail: isNgoRequester ? donorEmailFromBody : req.user.email,
      donorPhone: isNgoRequester ? donorPhoneFromBody : (req.user.phone || ""),
      foodItems,
      quantity,
      quantityUnit,
      pickupDate,
      pickupTime,
      address: address || (isNgoRequester ? "" : req.user.address),
      notes,
    });

    if (donation) {
      donation.pickup = pickup._id;
      donation.ngo = ngoId;
      donation.status = "Assigned";
      await donation.save();
    }

    // Real in-app notification for the donor's own dashboard bell.
    try {
      await Notification.create({
        userId: req.user._id,
        type: "pickup",
        title: "Pickup requested",
        message: `Your pickup request for ${pickup.pickupDate.toDateString()} at ${pickup.pickupTime} has been submitted.`,
      });
    } catch (notifyErr) {
      console.error("Pickup notification failed:", notifyErr.message);
    }

    try {
      await Activity.create({
        userId: req.user._id,
        type: "pickup",
        title: "Pickup scheduled",
        description: `${pickup.pickupDate.toDateString()} at ${pickup.pickupTime}`,
        status: "scheduled",
      });
    } catch (activityErr) {
      console.error("Pickup activity log failed:", activityErr.message);
    }

    const populatedPickup = await Pickup.findById(pickup._id).populate(
      "ngo",
      NGO_POPULATE_FIELDS
    );

    const emailData = pickupEmailData(populatedPickup);

    // Admin: new pickup request — tracked on the pickup document.
    try {
      await sendAndTrack(populatedPickup, "new_pickup_admin", {
        to: process.env.EMAIL_USER,
        ...newPickupAdminTemplate(emailData),
      });
    } catch (emailError) {
      console.error("Admin pickup email failed:", emailError.message);
    }

    // NGO: pickup assigned — only once per pickup, only if the NGO has an email.
    if (populatedPickup.ngo?.email && !populatedPickup.ngoAssignmentEmailSent) {
      try {
        const result = await sendEmail.sendTemplated({
          to: populatedPickup.ngo.email,
          ...ngoPickupAssignedTemplate(emailData),
        });
        if (result.success) {
          populatedPickup.ngoAssignmentEmailSent = true;
          await populatedPickup.save();
        } else {
          console.error("NGO assignment email failed:", result.error);
        }
      } catch (emailError) {
        console.error("NGO assignment email failed:", emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Pickup created successfully",
      data: populatedPickup,
    });
  } catch (error) {
    console.error("Create pickup error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL PICKUPS
const getPickups = async (req, res) => {
  try {
    // A donor only sees their own pickups; an NGO only sees pickups
    // assigned to its own organization; admins see everything.
    let filter = {};
    if (req.user.role === "donor") {
      filter = { donor: req.user._id };
    } else if (req.user.role === "ngo") {
      const myNgo = await NGO.findOne({ user: req.user._id }).select("_id");
      filter = myNgo ? { ngo: myNgo._id } : { _id: null }; // no linked NGO -> see nothing
    }

    const pickups = await Pickup.find(filter)
      .populate("ngo", NGO_POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pickups.length, data: pickups });
  } catch (error) {
    console.error("Get pickups error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE PICKUP
const getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid pickup ID" });
    }

    const pickup = await Pickup.findById(id).populate("ngo", NGO_POPULATE_FIELDS);
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found" });
    }
    if (req.user.role === "donor" && !(pickup.donor && pickup.donor.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: "You do not have access to this pickup" });
    }
    if (req.user.role === "ngo") {
      const myNgo = await NGO.findOne({ user: req.user._id }).select("_id");
      const ngoId = pickup.ngo?._id || pickup.ngo;
      if (!myNgo || !ngoId || !ngoId.equals(myNgo._id)) {
        return res.status(403).json({ success: false, message: "You do not have access to this pickup" });
      }
    }

    res.json({ success: true, data: pickup });
  } catch (error) {
    console.error("Get pickup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PICKUP
const updatePickup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid pickup ID" });
    }

    const existingPickup = await Pickup.findById(id);
    if (!existingPickup) {
      return res.status(404).json({ success: false, message: "Pickup not found" });
    }
    if (req.user.role === "ngo") {
      const myNgo = await NGO.findOne({ user: req.user._id }).select("_id");
      if (!myNgo || !existingPickup.ngo.equals(myNgo._id)) {
        return res.status(403).json({ success: false, message: "You do not have access to this pickup" });
      }
    }
    const oldStatus = existingPickup.status;

    // Only status changes are allowed through this endpoint — never trust
    // the client to reassign ngo/donor/food details on an existing pickup
    // (see the createPickup root-cause note above for why).
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "A status is required" });
    }
    const pickup = await Pickup.findByIdAndUpdate(id, { status }, {
      new: true,
      runValidators: true,
    }).populate("ngo", NGO_POPULATE_FIELDS);

    const statusChanged = pickup.status !== oldStatus;

    // Keep the linked donation's status consistent with the pickup instead
    // of letting the two drift apart (see section 26 data-consistency audit).
    if (statusChanged && pickup.donation) {
      const donationStatusMap = {
        "Picked Up": "Picked Up",
        Completed: "Completed",
        Cancelled: "Available", // cancelled pickup frees the donation back up
      };
      const nextDonationStatus = donationStatusMap[pickup.status];
      if (nextDonationStatus) {
        try {
          const update = { status: nextDonationStatus };
          if (pickup.status === "Cancelled") update.pickup = null;
          await Donation.findByIdAndUpdate(pickup.donation, update);
        } catch (syncError) {
          console.error("Donation status sync failed:", syncError.message);
        }
      }
    }

    // Real in-app notification for the donor whose pickup this is.
    if (statusChanged && pickup.donor) {
      try {
        await Notification.create({
          userId: pickup.donor,
          type: "pickup",
          title: `Pickup ${pickup.status.toLowerCase()}`,
          message: `Your pickup scheduled for ${pickup.pickupDate.toDateString()} is now ${pickup.status}.`,
        });
      } catch (notifyErr) {
        console.error("Pickup status notification failed:", notifyErr.message);
      }
    }

    if (statusChanged && pickup.donor) {
      const activityStatusMap = {
        Confirmed: "accepted",
        "Picked Up": "delivered",
        Completed: "completed",
        Cancelled: "cancelled",
      };
      try {
        await Activity.create({
          userId: pickup.donor,
          type: "pickup",
          title: `Pickup ${pickup.status.toLowerCase()}`,
          description: `${pickup.pickupDate.toDateString()} at ${pickup.pickupTime}`,
          status: activityStatusMap[pickup.status] || "scheduled",
        });
      } catch (activityErr) {
        console.error("Pickup status activity log failed:", activityErr.message);
      }
    }

    const emailData = pickupEmailData(pickup);

    if (statusChanged && pickup.donorEmail) {
      try {
        if (pickup.status === "Confirmed") {
          await sendAndTrack(pickup, "pickup_confirmed", {
            to: pickup.donorEmail,
            ...pickupConfirmedTemplate(emailData),
          });
        } else if (pickup.status === "Picked Up") {
          await sendAndTrack(pickup, "food_collected", {
            to: pickup.donorEmail,
            ...foodCollectedTemplate(emailData),
          });
        } else if (pickup.status === "Completed") {
          await sendAndTrack(pickup, "pickup_completed", {
            to: pickup.donorEmail,
            ...pickupCompletedTemplate({
              ...emailData,
              completionDate: new Date().toLocaleString(),
            }),
          });
        } else if (pickup.status === "Cancelled") {
          await sendAndTrack(pickup, "pickup_cancelled", {
            to: pickup.donorEmail,
            ...pickupCancelledTemplate(emailData),
          });
        }
      } catch (emailError) {
        console.error(
          `Pickup status-change email failed (${pickup.status}):`,
          emailError.message
        );
      }
    }

    res.json({
      success: true,
      message: "Pickup updated successfully",
      data: pickup,
    });
  } catch (error) {
    console.error("Update pickup error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE PICKUP
const deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid pickup ID" });
    }

    const pickup = await Pickup.findByIdAndDelete(id);
    if (!pickup) {
      return res.status(404).json({ success: false, message: "Pickup not found" });
    }

    res.json({ success: true, message: "Pickup deleted successfully" });
  } catch (error) {
    console.error("Delete pickup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPickup,
  getPickups,
  getPickupById,
  updatePickup,
  deletePickup,
};
