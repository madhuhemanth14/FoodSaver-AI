import React from "react";
import "../../styles/pickup-tracking.css";

const timeline = [
  {
    icon: "📄",
    title: "Donation Submitted",
    description: "Donor submitted the surplus food details.",
    time: "4:00 PM",
    completed: true,
  },
  {
    icon: "🤝",
    title: "NGO Accepted",
    description: "NGO reviewed and accepted the donation.",
    time: "4:04 PM",
    completed: true,
  },
  {
    icon: "📅",
    title: "Pickup Scheduled",
    description: "A pickup slot was confirmed with the donor.",
    time: "4:10 PM",
    completed: true,
  },
  {
    icon: "🧑‍✈️",
    title: "Driver Assigned",
    description: "A pickup driver has been assigned.",
    time: "4:22 PM",
    completed: true,
  },
  {
    icon: "🚚",
    title: "On the Way to NGO",
    description: "The driver is currently transporting the donation.",
    time: "Now",
    completed: true,
  },
  {
    icon: "✅",
    title: "Delivered",
    description: "Donation will be marked complete after NGO confirmation.",
    time: "",
    completed: false,
  },
];

export default function PickupTracking() {
  return (
    <main className="tracking-page">
      <div className="tracking-container">

        {/* Header */}

        <div className="tracking-header">

          <div>
            <h1>Pickup Status</h1>

            <p>
              Tracking ID: <strong>FSA-PK-208453</strong>
              {" · "}
              Donation: <strong>FSA-DN-208453</strong>
            </p>
          </div>

          <button className="tracking-top-button">
            📍 Track Pickup
          </button>

        </div>

        {/* Progress card */}

        <section className="tracking-progress-card">

          <div className="tracking-progress-top">

            <span className="tracking-status-badge">
              🔵 On the Way to NGO
            </span>

            <strong>89% complete</strong>

          </div>

          <div className="tracking-progress-bar">
            <div
              className="tracking-progress-fill"
              style={{ width: "89%" }}
            />
          </div>

          <div className="tracking-route-info">

            <span>
              🏠 6-3-1109, Somajiguda, Hyderabad, Telangana 500082
            </span>

            <span>
              🏁 12-4-56, Ashok Nagar, Hyderabad, Telangana 500020
            </span>

            <span>
              🚦 Traffic: Moderate
            </span>

            <span>
              ⏱ ETA: 3 min
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
                    item.completed ? "timeline-completed" : ""
                  }`}
                  key={item.title}
                >

                  <div className="timeline-marker">
                    {item.completed ? "✓" : "○"}
                  </div>

                  {index !== timeline.length - 1 && (
                    <div
                      className={`timeline-line ${
                        item.completed ? "timeline-line-active" : ""
                      }`}
                    />
                  )}

                  <div className="timeline-content">

                    <div className="timeline-title-row">

                      <h3>
                        {item.icon} {item.title}
                      </h3>

                      {item.time && (
                        <span className="timeline-time">
                          {item.time}
                        </span>
                      )}

                    </div>

                    <p>{item.description}</p>

                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* Right sidebar */}

          <aside className="tracking-sidebar">

            {/* Driver */}

            <div className="tracking-side-card">

              <h2>Driver Details</h2>

              <div className="driver-info">

                <div className="driver-avatar">
                  🧑‍✈️
                </div>

                <div>
                  <h3>Ramesh Kumar</h3>

                  <p>Mini Van · AP39AB1234</p>

                  <span className="driver-rating">
                    ⭐ 4.9
                  </span>
                </div>

              </div>

              <button className="call-driver-button">
                📞 Call +91 98765 43210
              </button>

            </div>

            {/* OTP */}

            <div className="tracking-side-card">

              <h2>OTP Verification</h2>

              <p className="otp-description">
                Share this code with the driver to confirm handover at
                pickup.
              </p>

              <div className="otp-code">
                4829
              </div>

              <p className="otp-warning">
                Do not share this OTP until the driver arrives.
              </p>

            </div>

            {/* Donation */}

            <div className="tracking-side-card">

              <h2>Donation Details</h2>

              <div className="donation-detail-row">
                <span>Food</span>
                <strong>Cooked Food</strong>
              </div>

              <div className="donation-detail-row">
                <span>Quantity</span>
                <strong>40 servings</strong>
              </div>

              <div className="donation-detail-row">
                <span>NGO</span>
                <strong>Helping Hands Foundation</strong>
              </div>

            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}