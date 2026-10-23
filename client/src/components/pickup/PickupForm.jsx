import { useState } from "react";
import { Building2, AlertTriangle, Truck } from "lucide-react";

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.food ||
      !formData.quantity ||
      !formData.date ||
      !formData.time ||
      !formData.address ||
      !formData.phone
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setError("");

    onSubmit({
      ...formData,
      ngoId: ngo?._id || ngo?.id,
      ngoName: ngo?.name || "Selected NGO",
    });
  };

  return (
    <form
      className="pickup-form-card"
      onSubmit={handleSubmit}
    >
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
          <span className="pickup-selected-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={18} color="var(--fs-primary, #2e7d32)" />
          </span>

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
        <div className="pickup-form-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={16} /> {error}
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
            placeholder="e.g. 5 kg, 20 packets"
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

        <div className="pickup-form-group pickup-form-group-full">
          <label htmlFor="address">
            Pickup Address <span>*</span>
          </label>

          <textarea
            id="address"
            name="address"
            rows="3"
            placeholder="Enter full pickup address with landmarks"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="pickup-form-group pickup-form-group-full">
          <label htmlFor="phone">
            Contact Phone <span>*</span>
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
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
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Truck size={16} /> Schedule Pickup
        </button>
      </div>
    </form>
  );
}

export default PickupForm;