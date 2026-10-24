import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rolePrefix } from "../utils/roles";
import DonationSuccess from "../components/DonationSuccess";
import "../styles/donation-theme.css";
import "../styles/donation-components.css";

/**
 * DonationSuccessPage
 * Reads the just-created donation from router state or sessionStorage
 * (preserving it if the user refreshes the page) and renders the
 * success screen. Only redirects if no donation was ever created.
 */
export default function DonationSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  const donation = useMemo(() => {
    if (location.state?.donation) {
      try {
        sessionStorage.setItem("fs_last_donation", JSON.stringify(location.state.donation));
      } catch {}
      return location.state.donation;
    }
    try {
      const stored = sessionStorage.getItem("fs_last_donation");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  }, [location.state]);

  useEffect(() => {
    if (!donation) {
      navigate(`${base}/donations`, { replace: true });
    }
  }, [donation, navigate, base]);

  if (!donation) return null;

  return (
    <div className="fs-module">
      <div className="fs-container">
        <DonationSuccess donation={donation} />
      </div>
    </div>
  );
}
