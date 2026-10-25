import React from "react";
import BackButton from "../components/common/BackButton";
import "./LegalPage.css";

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <div style={{ marginBottom: "20px" }}>
          <BackButton fallback="/" label="Back to Home" />
        </div>

        <header className="legal-header">
          <span className="legal-header-tag">Legal Document</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: October 25, 2026</p>
        </header>

        <section className="legal-content">
          <p>
            FoodSaver AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and ensuring transparency in how your personal information is collected, used, and safeguarded when using our surplus food donation platform.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information necessary to coordinate food donations and verify safety standards:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, verified email address, phone number, and user role (Food Donor, NGO, or Admin).</li>
            <li><strong>Organization Details:</strong> For NGOs and food banks, organization name, registered address, operational capacity, and accepted food categories.</li>
            <li><strong>Donation Data:</strong> Food names, quantities, preparation times, storage conditions, pickup locations, and food photos submitted for freshness analysis.</li>
            <li><strong>Technical &amp; Log Data:</strong> IP address, browser type, device information, and authentication access timestamps.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To match food donations with nearby registered NGOs and food banks.</li>
            <li>To coordinate logistics, pickup requests, and delivery confirmations.</li>
            <li>To verify donor email authenticity via one-time passcodes (OTP).</li>
            <li>To perform AI-assisted food freshness and shelf-life analysis on donated food items.</li>
            <li>To provide activity logs, donation history, and impact statistics.</li>
            <li>To maintain security, prevent unauthorized access, and protect community members.</li>
          </ul>

          <h2>3. Data Sharing &amp; Disclosure</h2>
          <p>
            We do not sell, rent, or trade your personal information. Information is shared strictly to fulfill food donations:
          </p>
          <ul>
            <li><strong>With Matched NGOs:</strong> When a donation or pickup is confirmed, pickup address and donor contact information are shared with the assigned NGO.</li>
            <li><strong>With Service Providers:</strong> Third-party infrastructure providers that host our database, process emails, or provide mapping services under strict confidentiality agreements.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests from public authorities.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We employ industry-standard technical measures including bcrypt password hashing, encrypted HTTPS communication, JSON Web Token (JWT) session security, and database-level role verification to protect your data.
          </p>

          <h2>5. Your Rights &amp; Choices</h2>
          <p>
            You have the right to access, update, or delete your account information at any time via your Profile Settings. You can also contact us directly to request full account and data removal.
          </p>

          <div className="legal-contact-box">
            <h3>Contact Privacy Officer</h3>
            <p>
              If you have questions or concerns regarding this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> privacy@foodsaverai.org
              <br />
              <strong>Address:</strong> 4th Floor, Greenway Tower, Hyderabad, Telangana, India
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
