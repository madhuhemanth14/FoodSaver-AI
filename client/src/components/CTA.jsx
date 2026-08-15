import React from "react";
import { ArrowRight, Heart } from "lucide-react";

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <div className="cta-icon">
          <Heart size={45} />
        </div>

        <div className="cta-text">
          <h2>Be a Hero. Donate Today!</h2>
          <p>Your small step can create a big change.</p>
        </div>

        <button className="cta-button">
          Get Started
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default CTA;