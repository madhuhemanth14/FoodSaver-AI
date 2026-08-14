import { useNavigate } from "react-router-dom";

function PickupHistory() {

  const navigate = useNavigate();

  const pickupHistory = [
    {
      id: 1001,
      ngo: "Helping Hands",
      food: "Rice",
      quantity: "5 kg",
      date: "12 Aug 2026",
      status: "COMPLETED"
    },
    {
      id: 1002,
      ngo: "Food For All",
      food: "Vegetables",
      quantity: "3 kg",
      date: "08 Aug 2026",
      status: "COMPLETED"
    }
  ];

  return (
    <main className="pickup-page">

      <div className="history-container">

        <button
          className="back-btn"
          onClick={() => navigate("/ngos")}
        >
          ← Find NGOs
        </button>

        <div className="history-header">

          <h1>Pickup History</h1>

          <p>
            Track all your previous food donations.
          </p>

        </div>

        <div className="history-list">

          {pickupHistory.map((pickup) => (

            <div
              className="history-card"
              key={pickup.id}
            >

              <div>
                <span className="history-label">
                  NGO
                </span>

                <h3>{pickup.ngo}</h3>
              </div>

              <div>
                <span className="history-label">
                  Food
                </span>

                <p>
                  {pickup.food} · {pickup.quantity}
                </p>
              </div>

              <div>
                <span className="history-label">
                  Date
                </span>

                <p>{pickup.date}</p>
              </div>

              <span className="history-status">
                ✓ Completed
              </span>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}

export default PickupHistory;