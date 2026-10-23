import { Leaf, Globe, Mail, Share2 } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: Brand & Social */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Leaf size={20} />
            </div>
            <span>
              FoodSaver <b>AI</b>
            </span>
          </div>
          <p>
            AI-powered platform that connects surplus food with people in
            need. Let's build a hunger-free, waste-free world.
          </p>
          <div className="social-icons" aria-label="Social media links">
            <a href="#" aria-label="Website" title="Website"><Globe size={16} /></a>
            <a href="#" aria-label="Email" title="Email"><Mail size={16} /></a>
            <a href="#" aria-label="Share" title="Share"><Share2 size={16} /></a>
            <a href="#" aria-label="FoodSaver AI" title="FoodSaver AI"><Leaf size={16} /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <a href="/#home">Home</a>
          <a href="/#about">About Us</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#features">Features</a>
          <a href="/#contact">Contact</a>
        </div>

        {/* Column 3: For Donors */}
        <div className="footer-column">
          <h4>For Donors</h4>
          <a href="/donor/donate">Donate Food</a>
          <a href="#">Donation Guidelines</a>
          <a href="/donor/donations">Track Donation</a>
          <a href="/#impact">Impact</a>
        </div>

        {/* Column 4: For NGOs */}
        <div className="footer-column">
          <h4>For NGOs</h4>
          <a href="/signup">Register NGO</a>
          <a href="#">Request Food</a>
          <a href="/ngo/pickups">Pickup Support</a>
          <a href="#">Resources</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2026 FoodSaver AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

