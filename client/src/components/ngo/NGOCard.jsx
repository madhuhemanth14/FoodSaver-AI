function NGOCard({ ngo, onViewDetails }) {
  return (
    <div className="ngo-card">

      <div className="ngo-card-header">
        <h3>{ngo.name}</h3>

        {ngo.verified && (
          <span className="verified-badge">
            ✓ Verified
          </span>
        )}
      </div>

      <p className="ngo-location">
        📍 {ngo.location}
      </p>

      <div className="ngo-info">
        <span>📏 {ngo.distance} km</span>
        <span>⭐ {ngo.rating}</span>
      </div>

      <div className="ngo-food">
        <strong>Accepts</strong>

        <div className="food-tags">
          {ngo.acceptedFoodTypes.map((food, index) => (
            <span
              key={index}
              className="food-tag"
            >
              {food}
            </span>
          ))}
        </div>
      </div>

      <button
        className="view-details-btn"
        onClick={() => onViewDetails(ngo)}
      >
        View Details
      </button>

    </div>
  );
}

export default NGOCard;