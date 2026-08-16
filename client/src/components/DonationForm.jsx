import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import FoodImageUpload from "./FoodImageUpload";
import { FOOD_CATEGORIES, UNITS } from "../data/mockDonations";

const initialFormState = {
  foodName: "",
  category: "",
  quantity: "",
  unit: "kg",
  preparationDate: "",
  expiryDate: "",
  description: "",
  location: "",
};

function validate(form, imageFile) {
  const errors = {};

  if (!form.foodName.trim()) {
    errors.foodName = "Please enter the food name.";
  } else if (form.foodName.trim().length < 2) {
    errors.foodName = "Food name is too short.";
  }

  if (!form.category) {
    errors.category = "Please select a category.";
  }

  if (!form.quantity || Number(form.quantity) <= 0) {
    errors.quantity = "Please enter a valid quantity.";
  }

  if (!form.unit) {
    errors.unit = "Please select a unit.";
  }

  if (!form.preparationDate) {
    errors.preparationDate = "Please select a preparation date.";
  }

  if (!form.expiryDate) {
    errors.expiryDate = "Please select an expiry date.";
  } else if (form.preparationDate && form.expiryDate < form.preparationDate) {
    errors.expiryDate = "Expiry date cannot be earlier than preparation date.";
  }

  if (!form.location.trim()) {
    errors.location = "Please enter a pickup location.";
  }

  if (!imageFile) {
    errors.image = "Please upload a food image.";
  }

  return errors;
}

/**
 * DonationForm
 * Step 1 of the donation flow — collects food details, description,
 * location and the food image, with full inline validation.
 *
 * Props:
 *  - initialData: object (optional prefilled values, used when editing)
 *  - onSubmit: (formData) => void   formData includes imageFile + imagePreviewUrl
 */
export default function DonationForm({ initialData, onSubmit }) {
  const [form, setForm] = useState({ ...initialFormState, ...initialData });
  const [imageFile, setImageFile] = useState(initialData?.imageFile || null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialData?.imagePreviewUrl || null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleImageChange = (file, previewUrl) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form, imageFile);
    setErrors(validationErrors);
    setTouched({
      foodName: true,
      category: true,
      quantity: true,
      unit: true,
      preparationDate: true,
      expiryDate: true,
      location: true,
      image: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({ ...form, quantity: Number(form.quantity), imageFile, imagePreviewUrl });
    }
  };

  const showError = (field) => touched[field] && errors[field];

  return (
    <form className="fs-card" style={{ padding: "24px" }} onSubmit={handleSubmit} noValidate>
      <div className="fs-form-grid">
        <div className="fs-field fs-field-full">
          <label htmlFor="foodName">Food Name</label>
          <input
            id="foodName"
            type="text"
            className={`fs-input ${showError("foodName") ? "fs-input-error" : ""}`}
            placeholder="e.g. Rice"
            value={form.foodName}
            onChange={handleChange("foodName")}
            onBlur={handleBlur("foodName")}
            aria-invalid={!!showError("foodName")}
          />
          {showError("foodName") && (
            <span className="fs-error-text">
              <AlertCircle size={14} /> {errors.foodName}
            </span>
          )}
        </div>

        <div className="fs-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className={`fs-select ${showError("category") ? "fs-input-error" : ""}`}
            value={form.category}
            onChange={handleChange("category")}
            onBlur={handleBlur("category")}
            aria-invalid={!!showError("category")}
          >
            <option value="">Select category</option>
            {FOOD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {showError("category") && (
            <span className="fs-error-text">
              <AlertCircle size={14} /> {errors.category}
            </span>
          )}
        </div>

        <div className="fs-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            className={`fs-input ${showError("location") ? "fs-input-error" : ""}`}
            placeholder="e.g. Ongole"
            value={form.location}
            onChange={handleChange("location")}
            onBlur={handleBlur("location")}
            aria-invalid={!!showError("location")}
          />
          {showError("location") && (
            <span className="fs-error-text">
              <AlertCircle size={14} /> {errors.location}
            </span>
          )}
        </div>

        <div className="fs-field">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="any"
            className={`fs-input ${showError("quantity") ? "fs-input-error" : ""}`}
            placeholder="e.g. 10"
            value={form.quantity}
            onChange={handleChange("quantity")}
            onBlur={handleBlur("quantity")}
            aria-invalid={!!showError("quantity")}
          />
          {showError("quantity") && (
            <span className="fs-error-text">
              <AlertCircle size={14} /> {errors.quantity}
            </span>
          )}
        </div>

        <div className="fs-field">
          <label htmlFor="unit">Unit</label>
          <select
            id="unit"
            className="fs-select"
            value={form.unit}
            onChange={handleChange("unit")}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="fs-field">
          <label htmlFor="preparationDate">Preparation Date</label>
          <input
            id="preparationDate"
            type="date"
            className={`fs-input ${showError("preparationDate") ? "fs-input-error" : ""}`}
            value={form.preparationDate}
            onChange={handleChange("preparationDate")}
            onBlur={handleBlur("preparationDate")}
            aria-invalid={!!showError("preparationDate")}
          />
          {showError("preparationDate") && (
            <span className="fs-error-text">
              <AlertCircle size={14} /> {errors.preparationDate}
            </span>
          )}
        </div>

        <div className="fs-field">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input
            id="expiryDate"
            type="date"
            className={`fs-input ${showError("expiryDate") ? "fs-input-error" : ""}`}
            value={form.expiryDate}
            onChange={handleChange("expiryDate")}
            onBlur={handleBlur("expiryDate")}
            aria-invalid={!!showError("expiryDate")}
          />
          {showError("expiryDate") && (
            <span className="fs-error-text">
              <AlertCircle size={14} /> {errors.expiryDate}
            </span>
          )}
        </div>

        <div className="fs-field fs-field-full">
          <label htmlFor="description">
            Description <span className="fs-optional">(optional but recommended)</span>
          </label>
          <textarea
            id="description"
            className="fs-textarea"
            placeholder="Any details that help the receiving NGO — e.g. freshly cooked, contains nuts, etc."
            value={form.description}
            onChange={handleChange("description")}
          />
        </div>

        <div className="fs-field-full">
          <FoodImageUpload
            file={imageFile}
            previewUrl={imagePreviewUrl}
            onChange={(file, url) => {
              handleImageChange(file, url);
              setTouched((prev) => ({ ...prev, image: true }));
            }}
            error={showError("image") ? errors.image : ""}
          />
        </div>
      </div>

      <div className="fs-form-actions">
        <button type="submit" className="fs-btn fs-btn-primary">
          Continue to AI Analysis
        </button>
      </div>
    </form>
  );
}
