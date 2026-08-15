import React from "react";
import { Leaf, Globe, Mail, Share2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <Leaf size={25} />
            <span>
              FoodSaver <b>AI</b>
            </span>
          </div>

          <p>
            AI-powered platform that connects surplus food with people in
            need. Let's build a hunger-free, waste-free world.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Donors */}
        <div className="footer-column">
          <h4>For Donors</h4>
          <a href="#">Donate Food</a>
          <a href="#">Donation Guidelines</a>
          <a href="#">Track Donation</a>
          <a href="#">Impact</a>
        </div>

        {/* NGOs */}
        <div className="footer-column">
          <h4>For NGOs</h4>
          <a href="#">Register NGO</a>
          <a href="#">Request Food</a>
          <a href="#">Pickup Support</a>
          <a href="#">Resources</a>
        </div>

        {/* Social */}
        <div className="footer-column follow">
          <h4>Follow Us</h4>

          <div className="social-icons">
            <a href="#" aria-label="Website">
              <Globe size={17} />
            </a>

            <a href="#" aria-label="Email">
              <Mail size={17} />
            </a>

            <a href="#" aria-label="Share">
              <Share2 size={17} />
            </a>

            <a href="#" aria-label="FoodSaver AI">
              <Leaf size={17} />
            </a>
          </div>

          <p>© 2024 FoodSaver AI.</p>
          <p>All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;