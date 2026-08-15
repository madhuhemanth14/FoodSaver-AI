import { useState } from "react";

function PickupForm({ ngo, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    food: "",
    quantity: "",
    date: "",
    time: "",
    address: "",
    phone: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      food,
      quantity,
      date,
      time,
      address,
      phone,
    } = formData;

    if (
      !food ||
      !quantity ||
      !date ||
      !time ||
      !address ||
      !phone
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (date < today) {
      setError("Please select a future pickup date.");
      return;
    }

    if (onSubmit) {
      onSubmit({
        ...formData,
        ngoId: ngo?.id,
        ngoName: ngo?.name,
      });
    }
  };

  return (
    <form className="pickup-form" onSubmit={handleSubmit}>
      <div className="pickup-form-header">
        <div>
          <h2>Schedule Food Pickup</h2>
          <p>
            Provide the pickup details for your food donation.
          </p>
        </div>
      </div>

      {ngo && (
        <div className="pickup-selected-ngo">
          <span className="pickup-selected-icon">🏢</span>

          <div>
            <strong>{ngo.name}</strong>
            <p>
              {ngo.address ||
                ngo.location ||
                "NGO location unavailable"}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="pickup-form-error">
          ⚠️ {error}
        </div>
      )}

      <div className="pickup-form-grid">
        <div className="pickup-form-group">
          <label htmlFor="food">
            Food Type <span>*</span>
          </label>

          <input
            id="food"
            name="food"
            type="text"
            placeholder="e.g. Rice, Vegetables"
            value={formData.food}
            onChange={handleChange}
          />
        </div>

        <div className="pickup-form-group">
          <label htmlFor="quantity">
            Quantity <span>*</span>
          </label>

          <input
            id="quantity"
            name="quantity"
            type="text"
            placeholder="e.g. 10 kg"
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>

        <div className="pickup-form-group">
          <label htmlFor="date">
            Pickup Date <span>*</span>
          </label>

          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={handleChange}
          />
        </div>

        <div className="pickup-form-group">
          <label htmlFor="time">
            Pickup Time <span>*</span>
          </label>

          <input
            id="time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <div className="pickup-form-group pickup-form-full">
          <label htmlFor="address">
            Pickup Address <span>*</span>
          </label>

          <textarea
            id="address"
            name="address"
            rows="3"
            placeholder="Enter the address where the food should be collected"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="pickup-form-group pickup-form-full">
          <label htmlFor="phone">
            Contact Number <span>*</span>
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="pickup-form-actions">
        {onCancel && (
          <button
            type="button"
            className="pickup-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="pickup-submit-btn"
        >
          🚚 Schedule Pickup
        </button>
      </div>
    </form>
  );
}

export default PickupForm;