import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function PickupRequest() {

  const location = useLocation();
  const navigate = useNavigate();

  const ngo = location.state?.ngo;

  const [formData, setFormData] = useState({
    foodType: "",
    quantity: "",
    pickupDate: "",
    pickupTime: "",
    address: "",
    notes: ""
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const pickup = {
      id: Date.now(),
      ngo,
      ...formData,
      status: "REQUESTED"
    };

    localStorage.setItem(
      "activePickup",
      JSON.stringify(pickup)
    );

    navigate("/pickup/tracking", {
      state: { pickup }
    });
  };

  if (!ngo) {
    return (
      <div className="pickup-page">
        <h2>No NGO selected</h2>

        <button
          className="schedule-btn"
          onClick={() => navigate("/ngos")}
        >
          Find NGO
        </button>
      </div>
    );
  }

  return (
    <main className="pickup-page">

      <div className="pickup-container">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="pickup-header">
          <h1>Schedule Food Pickup</h1>

          <p>
            Schedule a pickup with{" "}
            <strong>{ngo.name}</strong>
          </p>
        </div>

        <form
          className="pickup-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>Food Type</label>

            <select
              name="foodType"
              value={formData.foodType}
              onChange={handleChange}
              required
            >
              <option value="">
                Select food type
              </option>

              <option value="Cooked Food">
                Cooked Food
              </option>

              <option value="Rice">
                Rice
              </option>

              <option value="Vegetables">
                Vegetables
              </option>

              <option value="Fruits">
                Fruits
              </option>

              <option value="Bread">
                Bread
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>

            <input
              type="text"
              name="quantity"
              placeholder="Example: 5 kg"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Pickup Date</label>

              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Pickup Time</label>

              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label>Pickup Address</label>

            <textarea
              name="address"
              placeholder="Enter your pickup address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>

            <textarea
              name="notes"
              placeholder="Any special instructions?"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="schedule-btn"
          >
            Confirm Pickup Request →
          </button>

        </form>

      </div>

    </main>
  );
}

export default PickupRequest;