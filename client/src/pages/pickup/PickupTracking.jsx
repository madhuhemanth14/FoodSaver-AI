import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPickup } from "../../services/pickupService";
import "../../styles/pickup-tracking.css";

export default function PickupTracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPickup = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPickup(id);

        setPickup(data);
      } catch (err) {
        console.error("Failed to load pickup:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load pickup details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPickup();
    } else {
      setLoading(false);
      setError("Pickup ID is missing.");
    }
  }, [id]);

  if (loading) {
    return (
      <main className="tracking-page">
        <div className="tracking-container">
          <h1>Loading Pickup...</h1>
          <p>Getting your pickup details from the server.</p>
        </div>
      </main>
    );
  }

  if (error || !pickup) {
    return (
      <main className="tracking-page">
        <div className="tracking-container">
          <h1>Pickup Not Found</h1>
          <p>{error || "Pickup does not exist."}</p>

          <button
            type="button"
            onClick={() => navigate("/pickup/history")}
          >
            Back to Pickup History
          </button>
        </div>
      </main>
    );
  }

  const status = pickup.status || "Pending";

  const statusProgress = {
    Pending: 25,
    Confirmed: 50,
    "Picked Up": 75,
    Completed: 100,
    Cancelled: 100,
  };

  const progress = statusProgress[status] || 25;

  const timeline = [
    {
      title: "Pickup Request Submitted",
      description: "Your pickup request was submitted successfully.",
      completed: true,
    },
    {
      title: "Pickup Confirmed",
      description: "The NGO has confirmed the pickup request.",
      completed: [
        "Confirmed",
        "Picked Up",
        "Completed",
      ].includes(status),
    },
    {
      title: "Food Picked Up",
      description: "The donated food has been collected.",
      completed: [
        "Picked Up",
        "Completed",
      ].includes(status),
    },
    {
      title: "Delivered to NGO",
      description: "The food has been delivered to the NGO.",
      completed: status === "Completed",
    },
  ];

  return (
    <main className="tracking-page">
      <div className="tracking-container">

        {/* Header */}
        <div className="tracking-header">
          <div>
            <h1>Pickup Status</h1>

            <p>
              Pickup ID:{" "}
              <strong>{pickup._id}</strong>
            </p>
          </div>

          <button
            type="button"
            className="tracking-top-button"
          >
            Track Pickup
          </button>
        </div>

        {/* Progress */}
        <section className="tracking-progress-card">

          <div className="tracking-progress-top">
            <span className="tracking-status-badge">
              {status}
            </span>

            <strong>{progress}% complete</strong>
          </div>

          <div className="tracking-progress-bar">
            <div
              className="tracking-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="tracking-route-info">

            <span>
              📍 Pickup Address: {pickup.address}
            </span>

            <span>
              🏢 NGO:{" "}
              {pickup.ngo?.name || "NGO"}
            </span>

            {pickup.ngo?.address && (
              <span>
                📍 NGO Address: {pickup.ngo.address}
              </span>
            )}

            <span>
              📅 Pickup Date:{" "}
              {new Date(pickup.pickupDate).toLocaleDateString()}
            </span>

            <span>
              ⏰ Pickup Time: {pickup.pickupTime}
            </span>

          </div>

        </section>

        {/* Main content */}
        <div className="tracking-content">

          {/* Timeline */}
          <section className="tracking-timeline-card">

            <div className="tracking-timeline">

              {timeline.map((item, index) => (
                <div
                  className={`timeline-item ${
                    item.completed
                      ? "timeline-completed"
                      : ""
                  }`}
                  key={item.title}
                >

                  <div className="timeline-marker">
                    {item.completed ? "✓" : "○"}
                  </div>

                  {index !== timeline.length - 1 && (
                    <div
                      className={`timeline-line ${
                        item.completed
                          ? "timeline-line-active"
                          : ""
                      }`}
                    />
                  )}

                  <div className="timeline-content">

                    <div className="timeline-title-row">
                      <h3>{item.title}</h3>

                      {item.completed && (
                        <span className="timeline-time">
                          Done
                        </span>
                      )}
                    </div>

                    <p>{item.description}</p>

                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* Sidebar */}
          <aside className="tracking-sidebar">

            {/* NGO Details */}
            <div className="tracking-side-card">

              <h2>NGO Details</h2>

              <div className="driver-info">

                <div className="driver-avatar">
                  NGO
                </div>

                <div>
                  <h3>
                    {pickup.ngo?.name ||
                      "NGO"}
                  </h3>

                  <p>
                    {pickup.ngo?.shortName || ""}
                  </p>
                </div>

              </div>

              {pickup.ngo?.phone && (
                <p>
                  📞 {pickup.ngo.phone}
                </p>
              )}

              {pickup.ngo?.address && (
                <p>
                  📍 {pickup.ngo.address}
                </p>
              )}

            </div>

            {/* Food Details */}
            <div className="tracking-side-card">

              <h2>Food Details</h2>

              <p>
                <strong>Food:</strong>{" "}
                {pickup.foodItems?.join(", ")}
              </p>

              <p>
                <strong>Quantity:</strong>{" "}
                {pickup.quantity}{" "}
                {pickup.quantityUnit}
              </p>

              {pickup.notes && (
                <p>
                  <strong>Notes:</strong>{" "}
                  {pickup.notes}
                </p>
              )}

            </div>

            {/* Donor Details */}
            <div className="tracking-side-card">

              <h2>Donor Details</h2>

              <p>
                <strong>Name:</strong>{" "}
                {pickup.donorName}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {pickup.donorPhone}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/pickup/history")
              }
            >
              View Pickup History
            </button>

          </aside>

        </div>
      </div>
    </main>
  );
}