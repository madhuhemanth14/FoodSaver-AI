import React from "react";
import BackButton from "../components/common/BackButton";
import "./LegalPage.css";

export default function TermsOfService() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div style={{ marginBottom: "20px" }}>
          <BackButton fallback="/" label="Back to Home" />
        </div>

        <header className="legal-header">
          <span className="legal-header-tag">Legal Document</span>
          <h1>Terms of Service</h1>
          <p>Last updated: October 25, 2026</p>
        </header>

        <section className="legal-content">
          <p>
            Welcome to FoodSaver AI. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the service.
          </p>

          <h2>1. Platform Purpose &amp; Eligibility</h2>
          <p>
            FoodSaver AI provides a coordination platform connecting food donors (restaurants, caterers, grocery stores, and households) with registered non-governmental organizations (NGOs) and food banks to prevent food waste and alleviate hunger.
          </p>
          <ul>
            <li>Users must be at least 18 years of age or represent an authorized commercial or non-profit entity.</li>
            <li>Users must provide accurate, verified contact and identification details during registration.</li>
            <li>NGO accounts are subject to administrative review and verification prior to claim privileges.</li>
          </ul>

          <h2>2. Food Donor Responsibilities &amp; Safety Standards</h2>
          <p>
            Donors play a critical role in community health and safety. By listing food on FoodSaver AI, you affirm that:
          </p>
          <ul>
            <li>All donated food is safe, edible, and properly stored in accordance with local health regulations.</li>
            <li>Prepared food has been kept at safe holding temperatures (hot food above 60°C, cold food below 5°C).</li>
            <li>Information regarding preparation time, allergens, and ingredients is stated truthfully and accurately.</li>
            <li>Expired, contaminated, or spoiled food must never be listed or distributed under any circumstances.</li>
          </ul>

          <h2>3. AI Quality Screening Disclaimer</h2>
          <p>
            FoodSaver AI employs automated computer vision and freshness analysis to assist in estimating shelf life and quality. 
            <strong>
              This AI assistance does not replace human sensory evaluation and hygiene inspection.
            </strong> 
            Both donors and recipient NGOs maintain ultimate responsibility for visually inspecting and confirming food safety prior to distribution.
          </p>

          <h2>4. Pickup Coordination &amp; Fulfillment</h2>
          <p>
            Pickup timings and fulfillment depend on mutual agreement between donors and recipient NGOs. FoodSaver AI does not operate a dedicated freight fleet and acts as a digital matching and tracking system. Both parties agree to coordinate respectfully and communicate cancellations in a timely manner.
          </p>

          <h2>5. Prohibited Conduct</h2>
          <p>Users agree not to:</p>
          <ul>
            <li>Sell, monetize, or charge fees for donated food items received through the platform.</li>
            <li>Misrepresent food freshness, storage conditions, or organization verification credentials.</li>
            <li>Interfere with platform operations, attempt unauthorized access, or harass other users.</li>
          </ul>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, FoodSaver AI provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis, and shall not be held liable for indirect, incidental, or consequential damages resulting from platform use or food consumption arranged through the service.
          </p>

          <div className="legal-contact-box">
            <h3>Questions Regarding Terms</h3>
            <p>
              For legal inquiries or questions concerning these Terms of Service, please reach out to:
              <br />
              <strong>Email:</strong> legal@foodsaverai.org
              <br />
              <strong>Address:</strong> 4th Floor, Greenway Tower, Hyderabad, Telangana, India
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
