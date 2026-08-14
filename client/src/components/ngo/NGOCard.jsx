function NGOCard({ ngo, onViewDetails }) {
  const acceptedFoodTypes =
    ngo.acceptedFoodTypes?.length > 0
      ? ngo.acceptedFoodTypes
      : ["Food Donations"];

  return (
    <div className="ngo-card">

      {/* =========================
          HEADER
          ========================= */}

      <div className="ngo-card-header">

        <h3>
          {ngo.name || "Unnamed Organization"}
        </h3>

        {ngo.verified && (
          <span className="verified-badge">
            ✓ Verified
          </span>
        )}

      </div>


      {/* =========================
          LOCATION
          ========================= */}

      <p className="ngo-location">
        📍 {ngo.location || "Address unavailable"}
      </p>


      {/* =========================
          NGO INFO
          ========================= */}

      <div className="ngo-info">

        <span>
          📏{" "}
          {ngo.distance !== undefined
            ? `${ngo.distance} km`
            : "Distance unavailable"}
        </span>

        <span>
          ⭐{" "}
          {ngo.rating
            ? ngo.rating
            : "No rating"}
        </span>

      </div>


      {/* =========================
          FOOD TYPES
          ========================= */}

      <div className="ngo-food">

        <strong>
          Accepts
        </strong>

        <div className="food-tags">

          {acceptedFoodTypes.map(
            (food, index) => (
              <span
                key={index}
                className="food-tag"
              >
                {food}
              </span>
            )
          )}

        </div>

      </div>


      {/* =========================
          VIEW DETAILS
          ========================= */}

      <button
        className="view-details-btn"
        onClick={() =>
          onViewDetails(ngo)
        }
      >
        View Details
      </button>

    </div>
  );
}

export default NGOCard;