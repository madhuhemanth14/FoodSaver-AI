import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Globe, Mail, Share2, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DonationGuidelinesModal from "./common/DonationGuidelinesModal";
import ResourcesModal from "./common/ResourcesModal";
import TermsModal from "./common/TermsModal";
import TrackDonationModal from "./common/TrackDonationModal";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Smooth-scroll immediately if already on home page, otherwise React Router navigates
  const handleAnchorClick = (anchorId) => (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${anchorId}`);
      }
    }
  };

  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "FoodSaver AI",
      text: "Join FoodSaver AI to connect surplus food with verified NGOs and build a hunger-free world.",
      url: window.location.origin,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Role-aware destination paths
  const donatePath = user?.role === "ngo" ? "/ngo/dashboard" : "/donor/donate";
  const trackPath = user?.role === "ngo" ? "/ngo/donations" : "/donor/donations";
  const requestFoodPath = user?.role === "ngo" ? "/ngo/dashboard" : user?.role === "donor" ? "/donor/donate" : "/signup?role=ngo";
  const pickupPath = user?.role === "ngo" ? "/ngo/pickups" : user?.role === "donor" ? "/donor/pickups" : "/ngo/pickups";

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Column 1: Brand & Social */}
          <div className="footer-brand">
            <Link to="/" onClick={handleHomeClick} className="footer-logo" aria-label="FoodSaver AI Home">
              <div className="footer-logo-icon">
                <Leaf size={20} />
              </div>
              <span>
                FoodSaver <b>AI</b>
              </span>
            </Link>
            <p>
              AI-powered platform that connects surplus food with people in
              need. Let's build a hunger-free, waste-free world.
            </p>
            <div className="social-icons" aria-label="Social media links">
              <a
                href="https://foodsaver-ai-theta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official Website"
                title="FoodSaver AI Website"
              >
                <Globe size={16} />
              </a>
              <a
                href="mailto:support@foodsaverai.org"
                aria-label="Email Support"
                title="Email support@foodsaverai.org"
              >
                <Mail size={16} />
              </a>
              <button
                type="button"
                className="social-icon-btn"
                onClick={handleShare}
                aria-label="Share FoodSaver AI"
                title="Share FoodSaver AI"
              >
                <Share2 size={16} />
              </button>
              <Link
                to="/#home"
                onClick={handleHomeClick}
                aria-label="Scroll to top"
                title="Back to top"
              >
                <Leaf size={16} />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/#home" onClick={handleHomeClick}>Home</Link>
            <Link to="/#about" onClick={handleAnchorClick("about")}>About Us</Link>
            <Link to="/#how-it-works" onClick={handleAnchorClick("how-it-works")}>How It Works</Link>
            <Link to="/#features" onClick={handleAnchorClick("features")}>Features</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/#contact" onClick={handleAnchorClick("contact")}>Contact</Link>
          </div>

          {/* Column 3: For Donors */}
          <div className="footer-column">
            <h4>For Donors</h4>
            <Link to={donatePath}>Donate Food</Link>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setGuidelinesOpen(true)}
            >
              Donation Guidelines
            </button>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setTrackOpen(true)}
            >
              Track Donation
            </button>
            <Link to="/#impact" onClick={handleAnchorClick("impact")}>Impact</Link>
          </div>

          {/* Column 4: For NGOs */}
          <div className="footer-column">
            <h4>For NGOs</h4>
            <Link to="/signup?role=ngo" state={{ role: "NGO / Food Bank" }}>Register NGO</Link>
            <Link to={requestFoodPath}>Request Food</Link>
            <Link to={pickupPath}>Pickup Support</Link>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setResourcesOpen(true)}
            >
              Resources
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 FoodSaver AI. All rights reserved.</p>
        </div>

        {copied && (
          <div className="footer-toast" role="status">
            <Check size={16} />
            <span>Link copied to clipboard!</span>
          </div>
        )}
      </footer>

      {/* Guidelines Modal */}
      <DonationGuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
      />

      {/* Resources Modal */}
      <ResourcesModal
        isOpen={resourcesOpen}
        onClose={() => setResourcesOpen(false)}
        onOpenGuidelines={() => setGuidelinesOpen(true)}
      />

      {/* Terms & Privacy Policy Modal */}
      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
      />

      {/* Track Donation & Pickup Modal */}
      <TrackDonationModal
        isOpen={trackOpen}
        onClose={() => setTrackOpen(false)}
      />
    </>
  );
};

export default Footer;
