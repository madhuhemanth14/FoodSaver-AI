import { Link } from "react-router-dom";
import "./CTA.css";

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2>Ready to Reduce Food Waste?</h2>
        <p>
          Join thousands of donors and NGOs building a hunger-free,
          waste-free world — one shared meal at a time.
        </p>

        <div className="cta-buttons">
          <Link to="/donate" className="cta-btn cta-btn--primary">
            Donate Food
          </Link>
          <Link to="/signup" className="cta-btn cta-btn--outline">
            Join as NGO
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
