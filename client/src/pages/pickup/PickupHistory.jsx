import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPickups } from "../../services/pickupService";
import "../../styles/pickup-history.css";

function PickupHistory() {
  const navigate = useNavigate();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPickups = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyPickups();

        setPickups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load pickup history:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load pickup history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPickups();
  }, []);

  if (loading) {
    return (
      <main className="pickup-history-page">
        <div className="pickup-history-container">
          <div className="pickup-history-header">
            <div>
              <h1>Pickup History</h1>
              <p>Loading your pickup history...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pickup-history-page">
        <div className="pickup-history-container">
          <div className="pickup-history-header">
            <div>
              <h1>Pickup History</h1>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pickup-history-page">
      <div className="pickup-history-container">

        <div className="pickup-history-header">
          <div>
            <h1>Pickup History</h1>
            <p>
              Your pickup requests and their current status.
            </p>
          </div>
        </div>

        {pickups.length === 0 ? (
          <section className="pickup-history-list">
            <article className="pickup-history-card">
              <h2>No pickups found</h2>
              <p>
                You haven't created any pickup requests yet.
              </p>
            </article>
          </section>
        ) : (
          <section className="pickup-history-list">

            {pickups.map((pickup) => (
              <article
                className="pickup-history-card"
                key={pickup._id}
              >

                <div className="pickup-history-card-header">

                  <div>
                    <h2>
                      {pickup.ngo?.name || "NGO"}
                    </h2>

                    <span className="pickup-donation-id">
                      Pickup ID: {pickup._id}
                    </span>
                  </div>

                  <span className="pickup-success-badge">
                    {pickup.status}
                  </span>

                </div>

                <div className="pickup-history-info">

                  <div className="pickup-info-item">
                    <span className="pickup-info-label">
                      Food
                    </span>

                    <strong>
                      {pickup.foodItems?.length
                        ? pickup.foodItems.join(", ")
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="pickup-info-item">
                    <span className="pickup-info-label">
                      Quantity
                    </span>

                    <strong>
                      {pickup.quantity}{" "}
                      {pickup.quantityUnit || ""}
                    </strong>
                  </div>

                  <div className="pickup-info-item">
                    <span className="pickup-info-label">
                      Pickup Date
                    </span>

                    <strong>
                      {pickup.pickupDate
                        ? new Date(
                            pickup.pickupDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </strong>
                  </div>

                  <div className="pickup-info-item">
                    <span className="pickup-info-label">
                      Pickup Time
                    </span>

                    <strong>
                      {pickup.pickupTime || "N/A"}
                    </strong>
                  </div>

                </div>

                <div style={{ marginTop: "20px" }}>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/pickup/tracking/${pickup._id}`
                      )
                    }
                  >
                    View Pickup
                  </button>

                </div>

              </article>
            ))}

          </section>
        )}

      </div>
    </main>
  );
}

export default PickupHistory;