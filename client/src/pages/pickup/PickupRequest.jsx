import React, { useState } from "react";
import "../../styles/pickup-request.css";

const ngos = [
  "Helping Hands Foundation",
  "Annapurna Seva Trust",
  "Green Plate Initiative",
  "Nourish Community Kitchen",
  "Sunrise Orphan Care Home",
];

const foodTypes = [
  "Cooked Food",
  "Rice",
  "Vegetables",
  "Fruits",
  "Bread",
  "Dairy",
];

export default function PickupRequest() {
  const [form, setForm] = useState({
    ngo: "",
    foodType: "",
    date: "",
    time: "",
    quantity: "",
    contact: "",
    instructions: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.ngo ||
      !form.foodType ||
      !form.date ||
      !form.time ||
      !form.quantity ||
      !form.contact
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setMessage("Pickup request submitted successfully!");

    console.log("Pickup Request:", form);
  };

  const handleCancel = () => {
    setForm({
      ngo: "",
      foodType: "",
      date: "",
      time: "",
      quantity: "",
      contact: "",
      instructions: "",
    });

    setMessage("");
  };

  return (
    <main className="pickup-request-page">
      <div className="pickup-request-container">

        <div className="pickup-request-header">
          <div>
            <h1>Schedule a Pickup</h1>
            <p>
              Tell us what you're donating and we'll match it with the right NGO.
            </p>
          </div>
        </div>

        <form className="pickup-request-card" onSubmit={handleSubmit}>

          <div className="pickup-form-grid">

            {/* NGO */}
            <div className="pickup-field">
              <label htmlFor="ngo">
                NGO Selection
              </label>

              <select
                id="ngo"
                name="ngo"
                value={form.ngo}
                onChange={handleChange}
              >
                <option value="">Choose an NGO...</option>

                {ngos.map((ngo) => (
                  <option key={ngo} value={ngo}>
                    {ngo}
                  </option>
                ))}
              </select>
            </div>

            {/* Food */}
            <div className="pickup-field">
              <label htmlFor="foodType">
                Food Type
              </label>

              <select
                id="foodType"
                name="foodType"
                value={form.foodType}
                onChange={handleChange}
              >
                <option value="">Select food type...</option>

                {foodTypes.map((food) => (
                  <option key={food} value={food}>
                    {food}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="pickup-field">
              <label htmlFor="date">
                Pickup Date
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            {/* Time */}
            <div className="pickup-field">
              <label htmlFor="time">
                Pickup Time
              </label>

              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
              />
            </div>

            {/* Quantity */}
            <div className="pickup-field">
              <label htmlFor="quantity">
                Food Quantity <span>(approx. servings)</span>
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="e.g. 40"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            {/* Contact */}
            <div className="pickup-field">
              <label htmlFor="contact">
                Contact Number
              </label>

              <input
                id="contact"
                name="contact"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.contact}
                onChange={handleChange}
              />
            </div>

            {/* Instructions */}
            <div className="pickup-field pickup-field-full">
              <label htmlFor="instructions">
                Special Instructions <span>(optional)</span>
              </label>

              <textarea
                id="instructions"
                name="instructions"
                rows="4"
                placeholder="Gate code, packaging notes, contact person, etc."
                value={form.instructions}
                onChange={handleChange}
              />
            </div>

          </div>

          {message && (
            <div
              className={`pickup-message ${
                message.includes("successfully")
                  ? "pickup-message-success"
                  : "pickup-message-error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="pickup-form-actions">

            <button
              type="button"
              className="pickup-cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="pickup-submit-button"
            >
              Schedule Pickup
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}