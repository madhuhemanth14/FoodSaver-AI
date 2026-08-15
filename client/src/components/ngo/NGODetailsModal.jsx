import { useEffect } from "react";
import "../../styles/ngo-details.css";

// NOTE: This module doesn't know whether FoodSaver-AI already has a shared
// Modal component (path/API unknown from outside the repo). This component
// is self-contained so it drops in safely either way.
//
// If your project already has e.g. `src/components/Modal.jsx`, swap the
// <div className="ngo-details-modal__backdrop"> ... wrapper below for your
// shared <Modal onClose={onClose}> and delete the inline overlay markup —
// everything else (the NGO detail content) can stay as-is.

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
          <span role="img" aria-hidden="true">🏢</span>
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
            }}
          >
            ✕
          </button>

          <div className="ngo-details-page__title-row">
            <h2 id="ngo-details-modal-title" className="ngo-details-page__name">
              {ngo.name}
            </h2>
            <span className={ngo.verified ? "" : ""}>
              {ngo.verified ? "🟢 Verified" : "Unverified"}
            </span>
          </div>
          <span className="ngo-details-page__rating">⭐ {ngo.rating.toFixed(1)}</span>

          <div className="ngo-details-page__info-grid">
            <div className="ngo-details-page__info-item">
              📍 <span><strong>Address</strong>{ngo.address}</span>
            </div>
            <div className="ngo-details-page__info-item">
              📞 <span><strong>Phone</strong>{ngo.phone}</span>
            </div>
            <div className="ngo-details-page__info-item">
              ✉️ <span><strong>Email</strong>{ngo.email}</span>
            </div>
            <div className="ngo-details-page__info-item">
              🕒 <span><strong>Hours</strong>{ngo.openingHours}</span>
            </div>
          </div>

          <div>
            <p className="ngo-details-page__section-label">Accepted Food</p>
            <ul className="ngo-details-page__food-list">
              {ngo.acceptedFoodTypes.map((food) => (
                <li key={food} className="ngo-details-page__food-item">
                  ✓ {food}
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
