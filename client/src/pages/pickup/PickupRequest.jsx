import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";
import { createPickup } from "../../services/pickupService";
import { getDonationById } from "../../services/donationService";
import BackButton from "../../components/common/BackButton";
import {
  combineLocal,
  formatDateTime,
  maxPickupDate,
  minPickupDate,
  timeBounds,
  validatePickup,
} from "../../utils/pickupDateTime";
import "../../styles/pickup-request.css";

/**
 * Schedule a pickup.
 *
 * Workflow: donor donates -> NGO accepts (NGO dashboard) -> NGO schedules
 * HERE -> "Pending Confirmation" -> donor confirms. Food, quantity and donor
 * details come from the accepted donation (read-only); the NGO only chooses
 * date, time, address and notes. Every rule is re-checked by the backend.
 */
export default function PickupRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  const donationId = location.state?.donationId || "";

  const [donation, setDonation] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(Boolean(donationId));

  const [form, setForm] = useState({ date: "", time: "", address: "", instructions: "" });
  const [fieldError, setFieldError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== "ngo" || !donationId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await getDonationById(donationId);
        if (cancelled) return;
        setDonation(data);
        setForm((prev) => ({ ...prev, address: data.address || "" }));
        if (data.status === "Expired") {
          setLoadError("This food has expired. A pickup can no longer be scheduled for it.");
        } else if (data.status === "Closed" || data.pickup) {
          setLoadError("A pickup has already been scheduled for this donation.");
        } else if (data.status !== "Accepted") {
          setLoadError("Accept this donation from your dashboard before scheduling a pickup.");
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.response?.data?.message || "Couldn't load this donation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [donationId, user?.role]);

  const expiry = donation?.expiryDate || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setMessage("");
    // Re-validate date + time together as soon as both are present.
    if (name === "date" || name === "time") {
      setFieldError(next.date && next.time ? validatePickup(next.date, next.time, expiry) : "");
      if (name === "date" && next.date && next.date < minPickupDate()) {
        setFieldError("Pickup date cannot be in the past. Please choose today or a later date.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time || !form.address.trim()) {
      setMessage("Please fill in all required fields.");
      return;
    }
    const problem = validatePickup(form.date, form.time, expiry);
    if (problem) {
      setFieldError(problem);
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      const when = combineLocal(form.date, form.time);
      const created = await createPickup({
        donationId,
        pickupDate: form.date,
        pickupTime: form.time,
        // Exact instant in the NGO's own timezone — the backend compares this
        // against the real current time and the food's expiry.
        pickupAt: when.toISOString(),
        address: form.address.trim(),
        notes: form.instructions,
      });
      setMessage("Pickup scheduled successfully! Waiting for the donor to confirm.");
      setTimeout(() => navigate(`${base}/pickups/${created._id}`), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to schedule the pickup.");
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <div className="pickup-request-header">
      <div>
        <h1>Schedule a Pickup</h1>
        <p>
          {user?.role === "ngo"
            ? "Choose when you will collect the donation you accepted. The donor will be asked to confirm."
            : "Pickups are scheduled by the NGO that accepts your donation."}
        </p>
      </div>
    </div>
  );

  // Donors no longer request pickups: the NGO schedules and the donor confirms.
  if (user?.role !== "ngo") {
    return (
      <main className="pickup-request-page">
        <div className="pickup-request-container">
          <BackButton fallback={`${base}/dashboard`} />
          {header}
          <div className="pickup-request-card">
            <p>
              Once an NGO accepts your donation it will schedule a pickup. You will get a notification and
              can confirm it from your Pickup History.
            </p>
            <div className="pickup-form-actions">
              <button type="button" className="pickup-cancel-button" onClick={() => navigate(`${base}/pickups`)}>
                View Pickup History
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!donationId || loadError) {
    return (
      <main className="pickup-request-page">
        <div className="pickup-request-container">
          <BackButton fallback="/ngo/dashboard" />
          {header}
          <div className="pickup-request-card">
            <div className="pickup-message pickup-message-error">
              {loadError || "Accept an available donation from your dashboard first, then choose Schedule Pickup."}
            </div>
            <div className="pickup-form-actions">
              <button type="button" className="pickup-cancel-button" onClick={() => navigate("/ngo/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const maxDate = maxPickupDate(expiry);
  const timeLimits = timeBounds(form.date, expiry);

  return (
    <main className="pickup-request-page">
      <div className="pickup-request-container">
        <BackButton fallback="/ngo/dashboard" />
        {header}

        <form className="pickup-request-card" onSubmit={handleSubmit}>
          <div className="pickup-form-grid">
            {loading && <p>Loading donation…</p>}

            {donation && (
              <>
                <div className="pickup-field">
                  <label>Donor</label>
                  <input type="text" value={donation.donorName || ""} readOnly />
                </div>
                <div className="pickup-field">
                  <label>Food</label>
                  <input type="text" value={(donation.foodItems || []).join(", ")} readOnly />
                </div>
                <div className="pickup-field">
                  <label>Quantity</label>
                  <input type="text" value={`${donation.quantity} ${donation.quantityUnit || ""}`} readOnly />
                </div>
                <div className="pickup-field">
                  <label>Food Expires</label>
                  <input type="text" value={expiry ? formatDateTime(expiry) : "Not specified"} readOnly />
                </div>
              </>
            )}

            <div className="pickup-field">
              <label htmlFor="date">Pickup Date</label>
              <input
                id="date"
                name="date"
                type="date"
                min={minPickupDate()}
                max={maxDate}
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="pickup-field">
              <label htmlFor="time">Pickup Time</label>
              <input
                id="time"
                name="time"
                type="time"
                min={timeLimits.min}
                max={timeLimits.max}
                value={form.time}
                onChange={handleChange}
              />
            </div>

            {fieldError && (
              <div className="pickup-field pickup-field-full">
                <div className="pickup-message pickup-message-error" role="alert">
                  {fieldError}
                </div>
              </div>
            )}

            <div className="pickup-field pickup-field-full">
              <label htmlFor="address">Pickup Address</label>
              <textarea
                id="address"
                name="address"
                rows="3"
                placeholder="Enter the address where the food should be collected"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="pickup-field pickup-field-full">
              <label htmlFor="instructions">
                Special Instructions
                <span> (optional)</span>
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows="4"
                placeholder="Gate code, packaging notes, contact person, etc."
                value={form.instructions}
                onChange={handleChange}
              />
            </div>
          </div>

          {message && (
            <div
              className={`pickup-message ${
                message.includes("successfully") ? "pickup-message-success" : "pickup-message-error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="pickup-form-actions">
            <button
              type="button"
              className="pickup-cancel-button"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="pickup-submit-button"
              disabled={submitting || loading || Boolean(fieldError)}
            >
              {submitting ? "Scheduling..." : "Schedule Pickup"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
