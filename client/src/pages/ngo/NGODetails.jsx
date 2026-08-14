import { useLocation, useNavigate } from "react-router-dom";

function NGODetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const ngo = location.state?.ngo;

  if (!ngo) {
    return (
      <div className="ngo-details-page">
        <h2>NGO not found</h2>

        <button
          className="view-details-btn"
          onClick={() => navigate("/ngos")}
        >
          Back to NGOs
        </button>
      </div>
    );
  }

  return (
    <main className="ngo-details-page">

      <button
        className="back-btn"
        onClick={() => navigate("/ngos")}
      >
        ← Back to NGOs
      </button>

      <section className="ngo-details-card">

        <div className="ngo-details-header">

          <div>
            <h1>{ngo.name}</h1>

            {ngo.verified && (
              <span className="verified-badge">
                ✓ Verified NGO
              </span>
            )}
          </div>

          <div className="ngo-rating">
            ⭐ {ngo.rating}
          </div>

        </div>

        <div className="ngo-details-info">

          <div className="detail-box">
            <span>📍</span>
            <div>
              <strong>Location</strong>
              <p>{ngo.location}</p>
            </div>
          </div>

          <div className="detail-box">
            <span>📏</span>
            <div>
              <strong>Distance</strong>
              <p>{ngo.distance} km away</p>
            </div>
          </div>

          <div className="detail-box">
            <span>🕒</span>
            <div>
              <strong>Working Hours</strong>
              <p>9:00 AM - 6:00 PM</p>
            </div>
          </div>

        </div>

        <div className="accepted-food-section">

          <h2>Accepted Food Types</h2>

          <div className="food-tags">

            {ngo.acceptedFoodTypes.map((food) => (
              <span
                className="food-tag"
                key={food}
              >
                ✓ {food}
              </span>
            ))}

          </div>

        </div>

        <div className="ngo-description">

          <h2>About this NGO</h2>

          <p>
            This verified organization helps distribute
            surplus food to people and communities in need.
            Your donation can help reduce food waste and
            support those who need it most.
          </p>

        </div>

        <button
          className="schedule-btn"
          onClick={() =>
            navigate("/pickup/request", {
              state: { ngo }
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