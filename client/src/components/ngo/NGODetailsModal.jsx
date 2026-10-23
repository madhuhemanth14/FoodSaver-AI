import { useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Check,
  X,
} from "lucide-react";
import "../../styles/ngo-details.css";

/**
 * NGODetailsModal
 *
 * Props:
 *  - ngo: NGO | null — modal is hidden when null
 *  - onClose: () => void
 *  - onSchedulePickup: (ngo) => void
 */
export default function NGODetailsModal({ ngo, onClose, onSchedulePickup }) {
  useEffect(() => {
    if (!ngo) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ngo, onClose]);

  if (!ngo) return null;

  return (
    <div
      className="ngo-details-modal__backdrop"
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28, 43, 30, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div
        className="ngo-details-page__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ngo-details-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="ngo-details-page__image">
          <Building2 size={48} color="#ffffff" />
        </div>
        <div className="ngo-details-page__body">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close NGO details"
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              fontSize: "1.1rem",
              cursor: "pointer",
              color: "var(--fs-text-muted, #5c6b5e)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>

          <div className="ngo-details-page__title-row">
            <h2 id="ngo-details-modal-title" className="ngo-details-page__name">
              {ngo.name}
            </h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.85rem", fontWeight: 600, color: ngo.verified ? "#15803d" : "#64748b" }}>
              {ngo.verified ? (
                <>
                  <ShieldCheck size={14} /> Verified Partner
                </>
              ) : (
                "Unverified"
              )}
            </span>
          </div>
          <span className="ngo-details-page__rating" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Star size={14} fill="#c98a12" color="#c98a12" /> {ngo.rating.toFixed(1)}
          </span>

          <div className="ngo-details-page__info-grid">
            <div className="ngo-details-page__info-item">
              <MapPin size={16} color="var(--fs-primary, #2e7d32)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span><strong>Address</strong>{ngo.address}</span>
            </div>
            <div className="ngo-details-page__info-item">
              <Phone size={16} color="var(--fs-primary, #2e7d32)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span><strong>Phone</strong>{ngo.phone}</span>
            </div>
            <div className="ngo-details-page__info-item">
              <Mail size={16} color="var(--fs-primary, #2e7d32)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span><strong>Email</strong>{ngo.email}</span>
            </div>
            <div className="ngo-details-page__info-item">
              <Clock size={16} color="var(--fs-primary, #2e7d32)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span><strong>Hours</strong>{ngo.openingHours}</span>
            </div>
          </div>

          <div>
            <p className="ngo-details-page__section-label">Accepted Food</p>
            <ul className="ngo-details-page__food-list">
              {ngo.acceptedFoodTypes.map((food) => (
                <li key={food} className="ngo-details-page__food-item" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Check size={13} color="var(--fs-primary, #2e7d32)" /> {food}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="ngo-details-page__cta"
            onClick={() => onSchedulePickup?.(ngo)}
          >
            Schedule Pickup
          </button>
        </div>
      </div>
    </div>
  );
}
