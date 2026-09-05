import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createPickup,
} from "../../services/pickupService";
import "../../styles/pickup-request.css";

const foodTypes = [
  "Cooked Food",
  "Rice",
  "Vegetables",
  "Fruits",
  "Bread",
  "Dairy",
];

export default function PickupRequest() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedNGO = location.state?.ngo || null;

  const [form, setForm] = useState({
    ngo: selectedNGO?._id || "",
    foodType: "",
    date: "",
    time: "",
    quantity: "",
    contact: "",
    donorName: "",
    address: "",
    instructions: "",
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedNGO?._id) {
      setForm((prev) => ({
        ...prev,
        ngo: selectedNGO._id,
      }));
    }
  }, [selectedNGO]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.ngo ||
      !form.foodType ||
      !form.date ||
      !form.time ||
      !form.quantity ||
      !form.contact ||
      !form.donorName ||
      !form.address
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const pickupData = {
        ngo: form.ngo,

        donorName: form.donorName,

        donorPhone: form.contact,

        foodItems: [form.foodType],

        quantity: Number(form.quantity),

        quantityUnit: "kg",

        pickupDate: form.date,

        pickupTime: form.time,

        address: form.address,

        notes: form.instructions,
      };

      const createdPickup = await createPickup(pickupData);

      console.log("Created pickup:", createdPickup);

      setMessage("Pickup request submitted successfully!");

      // Go directly to tracking page using MongoDB _id
      setTimeout(() => {
        navigate(`/pickup/tracking/${createdPickup._id}`);
      }, 700);

    } catch (error) {
      console.error("Pickup creation failed:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create pickup request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <main className="pickup-request-page">
      <div className="pickup-request-container">

        <div className="pickup-request-header">
          <div>
            <h1>Schedule a Pickup</h1>

            <p>
              Tell us what you're donating and we'll match it
              with the right NGO.
            </p>
          </div>
        </div>

        <form
          className="pickup-request-card"
          onSubmit={handleSubmit}
        >

          <div className="pickup-form-grid">

            {/* NGO */}
            <div className="pickup-field pickup-field-full">
              <label>
                NGO Selection
              </label>

              <input
                type="text"
                value={
                  selectedNGO?.name ||
                  "No NGO selected"
                }
                readOnly
              />

              {!form.ngo && (
                <small>
                  Please select an NGO from the NGO Finder first.
                </small>
              )}
            </div>

            {/* Donor Name */}
            <div className="pickup-field">
              <label htmlFor="donorName">
                Donor Name
              </label>

              <input
                id="donorName"
                name="donorName"
                type="text"
                placeholder="Your name"
                value={form.donorName}
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
                <option value="">
                  Select food type...
                </option>

                {foodTypes.map((food) => (
                  <option
                    key={food}
                    value={food}
                  >
                    {food}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="pickup-field">
              <label htmlFor="quantity">
                Food Quantity (kg)
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={form.quantity}
                onChange={handleChange}
              />
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

            {/* Address */}
            <div className="pickup-field pickup-field-full">
              <label htmlFor="address">
                Pickup Address
              </label>

              <textarea
                id="address"
                name="address"
                rows="3"
                placeholder="Enter the address where the food should be collected"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {/* Instructions */}
            <div className="pickup-field pickup-field-full">
              <label htmlFor="instructions">
                Special Instructions
                <span> (optional)</span>
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
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="pickup-submit-button"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Schedule Pickup"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}