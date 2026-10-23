const ContactMessage = require("../models/ContactMessage");
const sendEmail = require("../services/emailService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The one authorized FoodSaver AI contact/admin address. ADMIN_EMAIL can
// override it via environment, but this is the documented default.
const ADMIN_RECIPIENT =
  process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "hello.foodsaverai@gmail.com";

function validate({ name, email, message }) {
  const errors = {};

  const trimmedName = String(name || "").trim();
  if (!trimmedName) errors.name = "Name is required.";
  else if (trimmedName.length < 2) errors.name = "Name is too short.";
  else if (trimmedName.length > 100) errors.name = "Name is too long.";

  const trimmedEmail = String(email || "").trim();
  if (!trimmedEmail) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(trimmedEmail)) errors.email = "Enter a valid email address.";

  const trimmedMessage = String(message || "").trim();
  if (!trimmedMessage) errors.message = "Message is required.";
  else if (trimmedMessage.length < 10) errors.message = "Message is too short.";
  else if (trimmedMessage.length > 2000) errors.message = "Message is too long.";

  return {
    errors,
    values: { name: trimmedName, email: trimmedEmail.toLowerCase(), message: trimmedMessage },
  };
}

// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { errors, values } = validate(req.body || {});

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fix the errors in the form.",
        errors,
      });
    }

    const saved = await ContactMessage.create(values);
    const sentAt = saved.createdAt || new Date();

    const text = [
      "New FoodSaver AI Contact Message",
      "",
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      "Message:",
      values.message,
      "",
      `Date/Time: ${sentAt.toLocaleString()}`,
    ].join("\n");

    const html = `
      <h2>New FoodSaver AI Contact Message</h2>
      <p><strong>Name:</strong> ${values.name}</p>
      <p><strong>Email:</strong> ${values.email}</p>
      <p><strong>Message:</strong><br/>${values.message.replace(/\n/g, "<br/>")}</p>
      <p><strong>Date/Time:</strong> ${sentAt.toLocaleString()}</p>
    `;

    // The message is already safely stored — a failed email must never
    // turn a captured message into a failed request for the user.
    const emailResult = await sendEmail.sendTemplated({
      to: ADMIN_RECIPIENT,
      subject: "New FoodSaver AI Contact Message",
      text,
      html,
      replyTo: values.email,
    });

    if (!emailResult.success) {
      console.error("Contact notification email failed:", emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: "Thanks — your message has been sent. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact submit error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong sending your message. Please try again.",
    });
  }
};

module.exports = { submitContact };
