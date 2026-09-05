import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DonationSuccess from "../components/DonationSuccess";
import "../styles/donation-theme.css";
import "../styles/donation-components.css";

/**
 * DonationSuccess (page) (Member 3)
 * Reads the just-created donation from router state (passed by
 * DonateFood.jsx after donationService.createDonation resolves) and
 * renders the success screen. If someone lands here directly without
 * state (e.g. a refresh), redirects back to the donation form.
 */
export default function DonationSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const donation = location.state?.donation;

  useEffect(() => {
    if (!donation) {
      navigate("/donate", { replace: true });
    }
  }, [donation, navigate]);

  if (!donation) return null;

  return (
    <div className="fs-module">
      <div className="fs-container">
        <DonationSuccess donation={donation} />
      </div>
    </div>
  );
}
