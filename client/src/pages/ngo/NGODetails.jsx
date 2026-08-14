import { useLocation, useNavigate } from "react-router-dom";

function NGODetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const ngo = location.state?.ngo;

  // NGO not found
  if (!ngo) {
    return (
      <main className="ngo-details-page">
        <div className="ngo-details-card">

          <h2>NGO not found</h2>

          <button
            className="view-details-btn"
            onClick={() => navigate("/ngos")}
          >
            ← Back to NGOs
          </button>

        </div>
      </main>
    );
  }

  // Safe fallback values for Google Places data
  const acceptedFoodTypes =
    ngo.acceptedFoodTypes?.length > 0
      ? ngo.acceptedFoodTypes
      : ["Food Donations"];

  const rating =
    ngo.rating && ngo.rating > 0
      ? ngo.rating
      : "No rating";

  const distance =
    ngo.distance !== undefined
      ? `${ngo.distance} km away`
      : "Distance unavailable";

  const address =
    ngo.location ||
    "Address unavailable";

  return (
    <main className="ngo-details-page">

      {/* =========================
          BACK BUTTON
          ========================= */}

      <button
        className="back-btn"
        onClick={() => navigate("/ngos")}
      >
        ← Back to NGOs
      </button>


      {/* =========================
          NGO DETAILS CARD
          ========================= */}

      <section className="ngo-details-card">

        {/* HEADER */}

        <div className="ngo-details-header">

          <div>

            <h1>
              {ngo.name || "Unnamed Organization"}
            </h1>

            {ngo.verified && (
              <span className="verified-badge">
                ✓ FoodSaver Verified
              </span>
            )}

          </div>

          <div className="ngo-rating">
            ⭐ {rating}
          </div>

        </div>


        {/* =========================
            NGO INFORMATION
            ========================= */}

        <div className="ngo-details-info">

          {/* LOCATION */}

          <div className="detail-box">

            <span>📍</span>

            <div>

              <strong>
                Location
              </strong>

              <p>
                {address}
              </p>

            </div>

          </div>


          {/* DISTANCE */}

          <div className="detail-box">

            <span>📏</span>

            <div>

              <strong>
                Distance
              </strong>

              <p>
                {distance}
              </p>

            </div>

          </div>


          {/* WORKING HOURS */}

          <div className="detail-box">

            <span>🕒</span>

            <div>

              <strong>
                Working Hours
              </strong>

              <p>
                9:00 AM - 6:00 PM
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            ACCEPTED FOOD
            ========================= */}

        <div className="accepted-food-section">

          <h2>
            Accepted Food Types
          </h2>

          <div className="food-tags">

            {acceptedFoodTypes.map(
              (food, index) => (
                <span
                  className="food-tag"
                  key={`${food}-${index}`}
                >
                  ✓ {food}
                </span>
              )
            )}

          </div>

        </div>


        {/* =========================
            ABOUT NGO
            ========================= */}

        <div className="ngo-description">

          <h2>
            About this Organization
          </h2>

          <p>
            {ngo.verified
              ? "This organization has been verified by FoodSaver and participates in our food donation network."
              : "This organization was discovered through Google Maps. FoodSaver verification can be completed by an administrator before accepting donations."}
          </p>

        </div>


        {/* =========================
            ACTIONS
            ========================= */}

        <button
          className="schedule-btn"
          onClick={() =>
            navigate("/pickup/request", {
              state: {
                ngo,
              },
            })
          }
        >
          Schedule Pickup →
        </button>

      </section>

    </main>
  );
}

export default NGODetails;