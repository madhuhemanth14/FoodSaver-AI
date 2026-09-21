const mongoose = require("mongoose");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");
const NGO = require("../models/NGO");
const sendEmail = require("../services/emailService");
const { sendAndTrack } = require("../utils/emailTrack");
const {
  donationSubmittedDonorTemplate,
  donationSubmittedAdminTemplate,
  aiAnalysisCompleteTemplate,
} = require("../services/emailTemplates");

function formatAiResult(aiAnalysis) {
  if (!aiAnalysis || !aiAnalysis.freshness) return "";
  const confidencePart =
    aiAnalysis.confidence != null ? ` (${aiAnalysis.confidence}% confidence)` : "";
  return `${aiAnalysis.freshness}${confidencePart}`;
}

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    // Donor identity always comes from the authenticated user, never from
    // client-supplied donorName/donorEmail/donorPhone/donor fields — those
    // are ignored even if present in the request body.
    const {
      foodItems,
      category,
      quantity,
      quantityUnit,
      description,
      address,
      preparationDate,
      expiryDate,
      aiAnalysis,
    } = req.body;

    // aiAnalysis, if present, is the donor's own real AI-analysis result for
    // this exact upload (produced by POST /api/ai/analyze moments earlier) —
    // whitelisted field-by-field rather than trusted wholesale.
    const cleanAiAnalysis = aiAnalysis
      ? {
          foodType: aiAnalysis.foodType || "",
          freshness: aiAnalysis.freshness || "",
          confidence: aiAnalysis.confidence != null ? aiAnalysis.confidence : null,
          recommendation: aiAnalysis.recommendation || "",
          analyzedAt: aiAnalysis.analyzedAt ? new Date(aiAnalysis.analyzedAt) : new Date(),
        }
      : undefined;

    const donation = await Donation.create({
      donor: req.user._id,
      donorName: req.user.name,
      donorEmail: req.user.email,
      donorPhone: req.user.phone || "",
      foodItems,
      category,
      quantity,
      quantityUnit,
      description,
      address: address || req.user.address || "",
      preparationDate,
      expiryDate: expiryDate || (cleanAiAnalysis && aiAnalysis.predictedExpiry) || undefined,
      aiAnalysis: cleanAiAnalysis,
    });

    const commonData = {
      donationId: donation._id,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      foodItems: donation.foodItems.join(", "),
      quantity: `${donation.quantity} ${donation.quantityUnit}`,
      location: donation.address,
      donationDate: donation.createdAt.toLocaleString(),
      expiryDate: donation.expiryDate ? donation.expiryDate.toLocaleString() : "",
      aiResult: formatAiResult(donation.aiAnalysis),
      status: donation.status,
    };

    // Donor confirmation — tracked on the donation document itself.
    try {
      await sendAndTrack(
        donation,
        "donation_submitted_donor",
        { to: donation.donorEmail, ...donationSubmittedDonorTemplate(commonData) }
      );
    } catch (emailErr) {
      console.error("Donation donor email failed:", emailErr.message);
    }

    // Real in-app notification for the donor's own dashboard bell — created
    // from this actual event, never mock/hardcoded data.
    try {
      await Notification.create({
        userId: req.user._id,
        type: "donation",
        title: "Donation submitted",
        message: `Your donation of ${donation.foodItems.join(", ")} is now listed as available.`,
      });
    } catch (notifyErr) {
      console.error("Donation notification failed:", notifyErr.message);
    }

    try {
      await Activity.create({
        userId: req.user._id,
        type: "donation",
        title: "Listed a new donation",
        description: donation.foodItems.join(", "),
        status: "created",
      });
    } catch (activityErr) {
      console.error("Donation activity log failed:", activityErr.message);
    }

    // Admin notification — separate email, logged but not tracked on the
    // document (the tracking fields reflect the donor-facing email).
    try {
      await sendEmail.sendTemplated({
        to: process.env.EMAIL_USER,
        ...donationSubmittedAdminTemplate(commonData),
      });
    } catch (emailErr) {
      console.error("Donation admin email failed:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Returns the Mongo filter that scopes donations to what req.user is
// allowed to see. This is the single place that enforces "a donor only
// sees their own donations" — never trust a client-supplied donorEmail.
// NGO accounts are linked to a specific NGO document via NGO.user (see
// authController.register / ngoController.getMyNGO), so an NGO now sees
// donations available to browse plus the ones actually assigned to it —
// never every NGO's assigned donations.
async function scopeFilterFor(user) {
  if (user.role === "admin") return {};
  if (user.role === "donor") return { donor: user._id };

  const myNgo = await NGO.findOne({ user: user._id }).select("_id");
  if (!myNgo) {
    // No linked NGO profile yet (shouldn't normally happen) — fall back to
    // browse-only visibility rather than exposing every NGO's donations.
    return { status: "Available" };
  }
  return { $or: [{ status: "Available" }, { ngo: myNgo._id }] };
}

// GET ALL DONATIONS
const getDonations = async (req, res) => {
  try {
    const filter = await scopeFilterFor(req.user);
    const donations = await Donation.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ONE DONATION
const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    const isOwner = donation.donor && donation.donor.equals(req.user._id);
    if (req.user.role === "donor" && !isOwner) {
      return res.status(403).json({ success: false, message: "You do not have access to this donation" });
    }

    res.json({ success: true, data: donation });
  } catch (error) {
    console.error("Get donation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /:id/analysis — persist the AI analysis result (produced by the
// existing/mock AI analysis flow — never fabricated here) and notify the donor.
const submitAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const { foodType, freshness, confidence, recommendation, predictedExpiry } = req.body;

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    const isOwner = donation.donor && donation.donor.equals(req.user._id);
    if (req.user.role === "donor" && !isOwner) {
      return res.status(403).json({ success: false, message: "You do not have access to this donation" });
    }

    donation.aiAnalysis = {
      foodType: foodType || "",
      freshness: freshness || "",
      confidence: confidence != null ? confidence : null,
      recommendation: recommendation || "",
      analyzedAt: new Date(),
    };
    if (predictedExpiry) {
      donation.expiryDate = new Date(predictedExpiry);
    }
    await donation.save();

    try {
      await sendAndTrack(donation, "ai_analysis_complete", {
        to: donation.donorEmail,
        ...aiAnalysisCompleteTemplate({
          foodType: donation.aiAnalysis.foodType,
          freshness: donation.aiAnalysis.freshness,
          confidence: donation.aiAnalysis.confidence,
          recommendation: donation.aiAnalysis.recommendation,
          analyzedAt: donation.aiAnalysis.analyzedAt.toLocaleString(),
        }),
      });
    } catch (emailErr) {
      console.error("AI analysis email failed:", emailErr.message);
    }

    res.json({ success: true, message: "Analysis result saved", data: donation });
  } catch (error) {
    console.error("Submit analysis error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /:id/cancel
const cancelDonation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const existing = await Donation.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    const isOwner = existing.donor && existing.donor.equals(req.user._id);
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ success: false, message: "You do not have access to this donation" });
    }

    const donation = await Donation.findByIdAndUpdate(
      id,
      { status: "Cancelled" },
      { new: true, runValidators: true }
    );

    try {
      await Activity.create({
        userId: req.user._id,
        type: "donation",
        title: "Donation cancelled",
        description: existing.foodItems.join(", "),
        status: "cancelled",
      });
    } catch (activityErr) {
      console.error("Donation cancel activity log failed:", activityErr.message);
    }

    res.json({ success: true, message: "Donation cancelled", data: donation });
  } catch (error) {
    console.error("Cancel donation error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  submitAnalysis,
  cancelDonation,
};
