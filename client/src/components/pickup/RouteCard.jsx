function RouteCard({ pickup, ngo }) {
  const ngoName =
    ngo?.name ||
    pickup?.ngoName ||
    "Selected NGO";

  const ngoAddress =
    ngo?.address ||
    ngo?.location ||
    pickup?.ngoAddress ||
    "Address unavailable";

  const pickupAddress =
    pickup?.address ||
    pickup?.pickupAddress ||
    "Pickup address unavailable";

  const distance =
    pickup?.distance ??
    ngo?.distance ??
    null;

  return (
    <div className="route-card">
      <div className="route-card-header">
        <div>
          <span className="route-card-label">
            Pickup Route
          </span>

          <h3>
            {pickup?.pickupId
              ? `Pickup #${pickup.pickupId}`
              : "Food Pickup"}
          </h3>
        </div>

        <div className="route-card-icon">
          🗺️
        </div>
      </div>

      <div className="route-route">
        {/* Pickup location */}
        <div className="route-location">
          <div className="route-marker pickup-marker">
            📍
          </div>

          <div className="route-location-content">
            <span>
              Pickup Location
            </span>

            <strong>
              {pickupAddress}
            </strong>
          </div>
        </div>

        {/* Connecting line */}
        <div className="route-line" />

        {/* NGO location */}
        <div className="route-location">
          <div className="route-marker ngo-marker">
            🏢
          </div>

          <div className="route-location-content">
            <span>
              Destination NGO
            </span>

            <strong>
              {ngoName}
            </strong>

            <small>
              {ngoAddress}
            </small>
          </div>
        </div>
      </div>

      {distance !== null && (
        <div className="route-distance">
          <span>🚗</span>
          <strong>
            {distance} km
          </strong>
          <span>
            estimated distance
          </span>
        </div>
      )}
    </div>
  );
}

export default RouteCard;