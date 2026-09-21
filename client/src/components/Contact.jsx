import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, Share2, Leaf } from "lucide-react";
import { submitContactForm } from "../services/contactService";
import ContactMap from "./ContactMap";
import "./Contact.css";

const CONTACT_EMAIL = "hello.foodsaverai@gmail.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }) {
  const errors = {};

  const trimmedName = name.trim();
  if (!trimmedName) errors.name = "Name is required.";
  else if (trimmedName.length < 2) errors.name = "Name is too short.";
  else if (trimmedName.length > 100) errors.name = "Name is too long.";

  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(trimmedEmail)) errors.email = "Enter a valid email address.";

  const trimmedMessage = message.trim();
  if (!trimmedMessage) errors.message = "Message is required.";
  else if (trimmedMessage.length < 10) errors.message = "Message is too short.";
  else if (trimmedMessage.length > 2000) errors.message = "Message is too long.";

  return errors;
}

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState(null); // null | "sent" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus(null);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    setStatus(null);

    try {
      const result = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      setStatus("sent");
      setStatusMessage(
        result?.message || "Thanks — your message has been sent. We'll get back to you soon."
      );
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      const responseErrors = err.response?.data?.errors;
      if (responseErrors) {
        setFieldErrors(responseErrors);
      }
      setStatus("error");
      setStatusMessage(
        err.response?.data?.message ||
          "Something went wrong sending your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "FoodSaver AI",
      text: "Don't Waste Food — Share Hope.",
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus("Link copied to clipboard!");
        setTimeout(() => setShareStatus(""), 2500);
      } catch {
        setShareStatus("Couldn't copy the link.");
        setTimeout(() => setShareStatus(""), 2500);
      }
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-title">
        <p className="section-eyebrow">CONTACT</p>
        <h2>Get in Touch</h2>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <a
            className="contact-info-card contact-info-card--link"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            <div className="contact-info-icon">
              <Mail size={18} />
            </div>
            <div>
              <span>EMAIL</span>
              <strong>{CONTACT_EMAIL}</strong>
            </div>
          </a>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Phone size={18} />
            </div>
            <div>
              <span>PHONE</span>
              <strong>+91 98765 43210</strong>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <MapPin size={18} />
            </div>
            <div>
              <span>ADDRESS</span>
              <strong>4th Floor, Greenway Tower, Hyderabad, Telangana, India</strong>
            </div>
          </div>

          <ContactMap />

          <div className="contact-socials">
            <Link to="/" aria-label="Website">
              <Globe size={16} />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email">
              <Mail size={16} />
            </a>
            <button type="button" onClick={handleShare} aria-label="Share">
              <Share2 size={16} />
            </button>
            <Link to="/" aria-label="FoodSaver AI">
              <Leaf size={16} />
            </Link>
          </div>
          {shareStatus && <p className="contact-share-status">{shareStatus}</p>}
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-form-row">
            <div className="contact-form-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>
            <div className="contact-form-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="How can we help?"
              rows={5}
              value={formData.message}
              onChange={handleChange}
            />
            {fieldErrors.message && <span className="field-error">{fieldErrors.message}</span>}
          </div>

          <button type="submit" className="contact-submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>

          {status === "sent" && (
            <p className="contact-success" role="status">
              {statusMessage}
            </p>
          )}
          {status === "error" && (
            <p className="contact-error" role="alert">
              {statusMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
