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
          <p className="ngo-card__name">
            <span role="img" aria-hidden="true">🏢</span> {ngo.name}
          </p>
          <span
            className={`ngo-card__badge ${
              ngo.verified ? "ngo-card__badge--verified" : "ngo-card__badge--unverified"
            }`}
          >
            {ngo.verified ? "🟢 Verified" : "Unverified"}
          </span>
        </div>
      </div>

      <div className="ngo-card__meta-row">
        <span className="ngo-card__rating">⭐ {ngo.rating.toFixed(1)}</span>
        <span>📍 {ngo.distance} km away</span>
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

      <div className="ngo-card__hours">
        <span role="img" aria-hidden="true">🕒</span> {ngo.openingHours}
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
