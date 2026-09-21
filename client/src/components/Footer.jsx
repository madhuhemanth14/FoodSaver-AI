import { Leaf, Globe, Mail, Share2 } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Leaf size={22} />
            <span>
              FoodSaver <b>AI</b>
            </span>
          </div>
          <p>
            AI-powered platform that connects surplus food with people in
            need. Let's build a hunger-free, waste-free world.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <a href="/#home">Home</a>
          <a href="/#about">About Us</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#features">Features</a>
          <a href="/#contact">Contact</a>
        </div>

        <div className="footer-column">
          <h4>For Donors</h4>
          <a href="/donor/donate">Donate Food</a>
          <a href="#">Donation Guidelines</a>
          <a href="/donor/donations">Track Donation</a>
          <a href="/#impact">Impact</a>
        </div>

        <div className="footer-column">
          <h4>For NGOs</h4>
          <a href="/signup">Register NGO</a>
          <a href="#">Request Food</a>
          <a href="/ngo/pickups">Pickup Support</a>
          <a href="#">Resources</a>
        </div>

        <div className="footer-column">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Website"><Globe size={16} /></a>
            <a href="#" aria-label="Email"><Mail size={16} /></a>
            <a href="#" aria-label="Share"><Share2 size={16} /></a>
            <a href="#" aria-label="FoodSaver AI"><Leaf size={16} /></a>
          </div>
        </div>
      </div>

      <p className="footer-copy">© 2026 FoodSaver AI. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
