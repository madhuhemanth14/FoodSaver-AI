const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const NGO = require("../models/NGO");
const sendEmail = require("../services/emailService");
const { expireIfOverdue } = require("../services/donationExpiry");
const { resolvePickupInstant, validatePickupInstant } = require("../utils/pickupTime");
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

// Pickup workflow (enforced here, never only in React):
//   Pending Confirmation -> Confirmed -> Picked Up -> Completed
// The NGO schedules (creating "Pending Confirmation"); the DONOR confirms;
// the NGO then marks Picked Up and Completed. Either side of an unfinished
// pickup can still be Cancelled by the NGO/admin (existing behaviour).
const ALLOWED_TRANSITIONS = {
  "Pending Confirmation": ["Confirmed", "Cancelled"],
  Confirmed: ["Picked Up", "Cancelled"],
  "Picked Up": ["Completed"],
  Completed: [],
  Cancelled: [],
};

// Who may move a pickup INTO each status.
const ROLES_FOR_TARGET = {
  Confirmed: ["donor"],
  "Picked Up": ["ngo", "admin"],
  Completed: ["ngo", "admin"],
  Cancelled: ["ngo", "admin"],
};

const TRANSITION_ERRORS = {
  "Pending Confirmation->Picked Up":
    "The donor must confirm the pickup before it can be marked as picked up.",
  "Pending Confirmation->Completed":
    "The donor must confirm and the food must be picked up before it can be marked as completed.",
  "Confirmed->Completed": "Pickup must be marked as picked up before it can be completed.",
  "Confirmed->Confirmed": "Pickup is already confirmed.",
  "Picked Up->Confirmed": "Pickup has already been picked up.",
  "Picked Up->Picked Up": "Pickup is already marked as picked up.",
};

function transitionError(from, to) {
  if (from === to && from === "Completed") return "Pickup is already completed.";
  if (from === "Completed") return "A completed pickup cannot be changed.";
  if (from === "Cancelled") return "A cancelled pickup cannot be changed.";
  return (
    TRANSITION_ERRORS[`${from}->${to}`] ||
    `Invalid status change: a ${from} pickup cannot be changed to ${to}.`
  );
}

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

// CREATE PICKUP — the NGO schedules a pickup for a donation it has accepted.
//
// Workflow: donor donates -> NGO accepts (PATCH /donations/:id/accept) ->
// NGO schedules (this endpoint) -> status "Pending Confirmation" -> donor
// confirms. Donor identity, food and quantity always come from the donation
// record on the server, never from the request body. The backend is the final
// source of truth for every rule below.
const createPickup = async (req, res) => {
  let closedDonation = null; // so we can roll the donation back if the insert fails
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message:
          "Pickups are scheduled by the NGO that accepts your donation. You will be asked to confirm the pickup once it is scheduled.",
      });
    }

    const { donationId, pickupAt, pickupDate, pickupTime, address, notes } = req.body;

    if (!donationId || !mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ success: false, message: "A valid accepted donation is required" });
    }

    const myNgo = await NGO.findOne({ user: req.user._id });
    if (!myNgo) {
      return res.status(404).json({
        success: false,
        message: "No NGO profile is linked to this account. Complete your NGO profile first.",
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // Expiry is re-checked on the server every time.
    if (await expireIfOverdue(donation)) {
      return res.status(409).json({
        success: false,
        message: "This food has expired. A pickup can no longer be scheduled for it.",
      });
    }
    if (donation.status === "Closed" || donation.pickup) {
      return res.status(409).json({
        success: false,
        message: "A pickup has already been scheduled for this donation.",
      });
    }
    if (donation.status !== "Accepted") {
      return res.status(409).json({
        success: false,
        message:
          donation.status === "Available"
            ? "Accept this donation before scheduling a pickup."
            : `This donation is ${donation.status.toLowerCase()} and cannot be scheduled.`,
      });
    }
    if (!donation.ngo || !donation.ngo.equals(myNgo._id)) {
      return res.status(403).json({
        success: false,
        message: "This donation was accepted by a different NGO.",
      });
    }
    if (!donation.donor) {
      return res.status(400).json({
        success: false,
        message: "This donation has no linked donor account, so the donor cannot confirm the pickup.",
      });
    }

    // Date + time are validated together as one instant, against the real
    // current time and against the food's expiry.
    const pickupInstant = resolvePickupInstant({ pickupAt, pickupDate, pickupTime });
    const timeError = validatePickupInstant(pickupInstant, donation.expiryDate, new Date());
    if (timeError) {
      return res.status(400).json({ success: false, message: timeError });
    }

    const pickupAddress = address || donation.address;
    if (!pickupAddress) {
      return res.status(400).json({ success: false, message: "A pickup address is required" });
    }

    // Close the donation FIRST with one atomic conditional update. Whoever
    // wins this update is the only one who can create the pickup, so a
    // double-click or a second request cannot create a duplicate.
    closedDonation = await Donation.findOneAndUpdate(
      {
        _id: donation._id,
        status: "Accepted",
        ngo: myNgo._id,
        pickup: null,
        $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }],
      },
      { $set: { status: "Closed", closedAt: new Date() } },
      { new: true }
    );
    if (!closedDonation) {
      return res.status(409).json({
        success: false,
        message: "This donation is no longer available to schedule. Please refresh.",
      });
    }

    let pickup;
    try {
      pickup = await Pickup.create({
        ngo: myNgo._id,
        donation: donation._id,
        donor: donation.donor,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone || "Not provided",
        foodItems: donation.foodItems,
        quantity: donation.quantity,
        quantityUnit: donation.quantityUnit,
        pickupAt: pickupInstant,
        pickupDate: String(pickupDate || "").slice(0, 10) || pickupInstant,
        pickupTime: pickupTime || pickupInstant.toISOString().slice(11, 16),
        address: pickupAddress,
        notes,
        status: "Pending Confirmation",
      });
    } catch (createErr) {
      // Put the donation back so the NGO can try again.
      await Donation.updateOne(
        { _id: donation._id, status: "Closed" },
        { $set: { status: "Accepted", closedAt: null } }
      );
      throw createErr;
    }

    await Donation.updateOne({ _id: donation._id }, { $set: { pickup: pickup._id } });

    // In-app notifications: the donor must confirm; the NGO gets a record.
    try {
      await Notification.create({
        userId: donation.donor,
        type: "pickup",
        title: "Pickup scheduled — please confirm",
        message: `${myNgo.name} scheduled a pickup for ${pickup.pickupDate.toDateString()} at ${pickup.pickupTime}. Please confirm it.`,
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

// UPDATE PICKUP (status changes only)
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

    // Ownership: the NGO that owns the pickup, or the donor it belongs to.
    if (req.user.role === "ngo") {
      const myNgo = await NGO.findOne({ user: req.user._id }).select("_id");
      if (!myNgo || !existingPickup.ngo.equals(myNgo._id)) {
        return res.status(403).json({ success: false, message: "You do not have access to this pickup" });
      }
    } else if (req.user.role === "donor") {
      if (!existingPickup.donor || !existingPickup.donor.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: "You do not have access to this pickup" });
      }
    }

    // Pickups created before this workflow used "Pending".
    const oldStatus = existingPickup.status === "Pending" ? "Pending Confirmation" : existingPickup.status;

    // Only status changes are allowed through this endpoint — never trust
    // the client to reassign ngo/donor/food details on an existing pickup.
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "A status is required" });
    }
    if (!Pickup.schema.path("status").enumValues.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    // Who may perform this step (a donor can only confirm; they can never
    // mark Picked Up or Completed).
    const allowedRoles = ROLES_FOR_TARGET[status] || [];
    if (!allowedRoles.includes(req.user.role)) {
      const message =
        req.user.role === "donor"
          ? "Donors can only confirm a pickup. The NGO marks it as picked up and completed."
          : status === "Confirmed"
          ? "Only the donor can confirm a scheduled pickup."
          : "You are not allowed to make this status change.";
      return res.status(403).json({ success: false, message });
    }

    if (!(ALLOWED_TRANSITIONS[oldStatus] || []).includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: transitionError(oldStatus, status) });
    }

    const stamp = { Confirmed: "confirmedAt", "Picked Up": "pickedUpAt", Completed: "completedAt" }[status];
    const update = { status };
    if (stamp) update[stamp] = new Date();

    // Conditional on the status we just validated, so two quick clicks (or
    // two tabs) can't both apply the same transition.
    const pickup = await Pickup.findOneAndUpdate(
      { _id: id, status: existingPickup.status },
      update,
      { new: true, runValidators: true }
    ).populate("ngo", NGO_POPULATE_FIELDS);

    if (!pickup) {
      return res.status(409).json({
        success: false,
        message: "This pickup was just updated by someone else. Please refresh and try again.",
      });
    }

    const statusChanged = pickup.status !== oldStatus;

    // Keep the linked donation's status consistent with the pickup instead
    // of letting the two drift apart (see section 26 data-consistency audit).
    if (statusChanged && pickup.donation) {
      try {
        if (pickup.status === "Cancelled") {
          // Frees the donation again ONLY if the food has not expired.
          const linked = await Donation.findById(pickup.donation);
          if (linked) {
            const overdue = linked.expiryDate && linked.expiryDate.getTime() <= Date.now();
            const otherActive = await Pickup.exists({
              donation: linked._id,
              _id: { $ne: pickup._id },
              status: { $in: ["Pending Confirmation", "Confirmed", "Picked Up"] },
            });
            if (overdue) {
              await Donation.findByIdAndUpdate(linked._id, { status: "Expired", ngo: null, pickup: null });
            } else if (!otherActive) {
              await Donation.findByIdAndUpdate(linked._id, {
                status: "Available",
                ngo: null,
                pickup: null,
                acceptedAt: null,
                closedAt: null,
              });
            }
          }
        } else if (pickup.status === "Picked Up" || pickup.status === "Completed") {
          await Donation.findByIdAndUpdate(pickup.donation, { status: pickup.status });
        }
      } catch (syncError) {
        console.error("Donation status sync failed:", syncError.message);
      }
    }

    // When the donor confirms, tell the NGO that is waiting on them.
    if (statusChanged && pickup.status === "Confirmed" && req.user.role === "donor") {
      try {
        const ngoDoc = await NGO.findById(pickup.ngo._id || pickup.ngo).select("user");
        if (ngoDoc?.user) {
          await Notification.create({
            userId: ngoDoc.user,
            type: "pickup",
            title: "Pickup confirmed by donor",
            message: `${pickup.donorName} confirmed the pickup for ${pickup.pickupDate.toDateString()} at ${pickup.pickupTime}.`,
          });
        }
      } catch (notifyErr) {
        console.error("NGO confirmation notification failed:", notifyErr.message);
      }
    }

    // Real in-app notification for the donor whose pickup this is.
    if (statusChanged && pickup.donor && req.user.role !== "donor") {
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
