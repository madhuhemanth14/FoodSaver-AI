import { useLocation, useNavigate } from "react-router-dom";

function PickupTracking() {

  const location = useLocation();
  const navigate = useNavigate();

  const storedPickup =
    JSON.parse(localStorage.getItem("activePickup"));

  const pickup =
    location.state?.pickup || storedPickup;

  const statuses = [
    {
      key: "REQUESTED",
      title: "Request Sent",
      description: "Your pickup request has been submitted."
    },
    {
      key: "NGO_ACCEPTED",
      title: "NGO Accepted",
      description: "The NGO has accepted your donation."
    },
    {
      key: "SCHEDULED",
      title: "Pickup Scheduled",
      description: "Pickup date and time have been confirmed."
    },
    {
      key: "PICKUP_ASSIGNED",
      title: "Pickup Assigned",
      description: "A pickup partner has been assigned."
    },
    {
      key: "PICKED_UP",
      title: "Food Picked Up",
      description: "Your food has been collected."
    },
    {
      key: "COMPLETED",
      title: "Completed",
      description: "Your donation reached the NGO."
    }
  ];

  // If there is no pickup
  if (!pickup) {
    return (
      <main className="pickup-page">

        <h2>No active pickup found.</h2>

        <button
          className="schedule-btn"
          onClick={() => navigate("/ngos")}
        >
          Find an NGO
        </button>

      </main>
    );
  }

  // Find current status
  const currentIndex =
    statuses.findIndex(
      (item) => item.key === pickup.status
    );


  // ⭐ ADD handleNextStatus HERE
  const handleNextStatus = () => {

    const nextIndex = currentIndex + 1;

    if (nextIndex >= statuses.length) {
      return;
    }

    const updatedPickup = {
      ...pickup,
      status: statuses[nextIndex].key
    };

    localStorage.setItem(
      "activePickup",
      JSON.stringify(updatedPickup)
    );

    window.location.reload();
  };


  return (
    <main className="pickup-page">

      <div className="tracking-container">

        <button
          className="back-btn"
          onClick={() => navigate("/ngos")}
        >
          ← Find More NGOs
        </button>

        <div className="tracking-header">

          <h1>Pickup Tracking</h1>

          <p>
            Pickup ID: #{pickup.id}
          </p>

        </div>

        <div className="tracking-card">

          <div className="tracking-summary">

            <div>
              <span>NGO</span>
              <strong>
                {pickup.ngo?.name}
              </strong>
            </div>

            <div>
              <span>Food</span>
              <strong>
                {pickup.foodType}
              </strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>
                {pickup.quantity}
              </strong>
            </div>

          </div>

          <div className="timeline">

            {statuses.map((status, index) => {

              const completed =
                index <= currentIndex;

              return (
                <div
                  className={`timeline-item ${
                    completed ? "completed" : ""
                  }`}
                  key={status.key}
                >

                  <div className="timeline-dot">
                    {completed ? "✓" : index + 1}
                  </div>

                  <div className="timeline-content">

                    <h3>
                      {status.title}
                    </h3>

                    <p>
                      {status.description}
                    </p>

                  </div>

                </div>
              );

            })}

          </div>


          {/* ⭐ ADD BUTTON HERE */}

          <button
            className="demo-status-btn"
            onClick={handleNextStatus}
            disabled={
              currentIndex >= statuses.length - 1
            }
          >
            Demo: Move to Next Status
          </button>


          <button
            className="schedule-btn"
            onClick={() =>
              navigate("/pickup/history")
            }
          >
            View Pickup History
          </button>

        </div>

      </div>

    </main>
  );
}

export default PickupTracking;