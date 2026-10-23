import {
  Building2,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import "../../styles/ngo-card.css";

/**
 * NGOCard
 *
 * Props:
 *  - ngo: NGO object (see mockNGOs.js for shape)
 *  - selected: boolean — visually highlight when selected on the map
 *  - onViewDetails: (ngo) => void
 *  - onSchedulePickup: (ngo) => void
 *  - onSelect: (ngo) => void — fired when the card itself is clicked/focused
 */
export default function NGOCard({ ngo, selected, onViewDetails, onSchedulePickup, onSelect }) {
  return (
    <div
      className={`ngo-card${selected ? " ngo-card--selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(ngo)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(ngo);
        }
      }}
      aria-label={`${ngo.name}, ${ngo.distance} kilometres away`}
    >
      <div className="ngo-card__header">
        <div className="ngo-card__title-group">
          <p className="ngo-card__name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={16} color="var(--fs-primary, #2e7d32)" /> {ngo.name}
          </p>
          <span
            className={`ngo-card__badge ${
              ngo.verified ? "ngo-card__badge--verified" : "ngo-card__badge--unverified"
            }`}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {ngo.verified ? (
              <>
                <ShieldCheck size={13} /> Verified
              </>
            ) : (
              "Unverified"
            )}
          </span>
        </div>
      </div>

      <div className="ngo-card__meta-row">
        <span className="ngo-card__rating" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Star size={13} fill="#c98a12" color="#c98a12" /> {ngo.rating.toFixed(1)}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <MapPin size={13} color="var(--fs-primary, #2e7d32)" /> {ngo.distance} km away
        </span>
      </div>

      <p className="ngo-card__address">{ngo.address}</p>

      <div>
        <p className="ngo-card__section-label">Accepts</p>
        <div className="ngo-card__tags">
          {ngo.acceptedFoodTypes.map((food) => (
            <span key={food} className="ngo-card__tag">
              {food}
            </span>
          ))}
        </div>
      </div>

      <div className="ngo-card__hours" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <Clock size={14} color="var(--fs-text-muted, #5c6b5e)" /> {ngo.openingHours}
      </div>

      <div className="ngo-card__actions">
        <button
          type="button"
          className="ngo-card__btn ngo-card__btn--outline"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(ngo);
          }}
        >
          View Details
        </button>
        <button
          type="button"
          className="ngo-card__btn ngo-card__btn--filled"
          onClick={(e) => {
            e.stopPropagation();
            onSchedulePickup?.(ngo);
          }}
        >
          Schedule Pickup
        </button>
      </div>
    </div>
  );
}
