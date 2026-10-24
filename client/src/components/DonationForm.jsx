import React, { useState } from "react";
import {
  AlertCircle,
  Utensils,
  Layers,
  Scale,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Camera,
  ArrowRight,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react";
import FoodImageUpload from "./FoodImageUpload";
import { FOOD_CATEGORIES, UNITS } from "../data/mockDonations";

const initialFormState = {
  foodName: "",
  category: "",
  quantity: "",
  unit: "kg",
  preparationDate: "",
  preparationTime: "",
  description: "",
  location: "",
  expirationDate: "",
  expirationTime: "",
};

const pad2 = (n) => String(n).padStart(2, "0");

// "2026-10-01" -> "01/10/2026"
const displayDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

// "18:00" -> "06:00 PM"
const displayTime = (hhmm) => {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return "";
  const h = Number(m[1]);
  return `${pad2(h % 12 === 0 ? 12 : h % 12)}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
};

function validate(form, imageFile, conflictPending) {
  const errors = {};

  if (!form.foodName.trim()) {
    errors.foodName = "Please enter the food name.";
  }

  if (conflictPending) {
    errors.image = "Your photo doesn't match the food name. Please choose which one is correct.";
  }

  if (!form.category) {
    errors.category = "Please select a category.";
  }

  if (!form.quantity || Number(form.quantity) <= 0) {
    errors.quantity = "Please enter a valid quantity greater than 0.";
  }

  if (!form.unit) {
    errors.unit = "Please select a unit.";
  }

  if (!form.preparationDate) {
    errors.preparationDate = "Please select a preparation date.";
  }

  if (!form.preparationTime) {
    errors.preparationTime = "Please select a preparation time.";
  }

  if (!form.location.trim()) {
    errors.location = "Please enter a pickup location.";
  }

  return errors;
}

const MAX_DESCRIPTION_LENGTH = 300;

/**
 * DonationForm
 * Step 1 of the donation flow — collects food details, description,
 * location and the food image, organized into intuitive visual sections
 * with clear field-level validation and live AI analysis feedback.
 */
export default function DonationForm({
  initialData,
  onSubmit,
  onLiveChange,
  aiLoading = false,
  aiError = "",
  aiAnalysis = null,
  expiry = { date: "", time: "" },
  conflictPending = false,
  onKeepEntry,
  onRetry,
}) {
  const [form, setForm] = useState({ ...initialFormState, ...initialData });
  const [imageFile, setImageFile] = useState(initialData?.imageFile || null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialData?.imagePreviewUrl || null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (onLiveChange) onLiveChange({ ...next, imageFile, imagePreviewUrl });
      return next;
    });
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleImageChange = (file, previewUrl) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
    if (onLiveChange) onLiveChange({ ...form, imageFile: file, imagePreviewUrl: previewUrl });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form, imageFile, conflictPending);
    setErrors(validationErrors);
    setTouched({
      foodName: true,
      category: true,
      quantity: true,
      unit: true,
      preparationDate: true,
      preparationTime: true,
      location: true,
      image: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({ ...form, quantity: Number(form.quantity), imageFile, imagePreviewUrl });
    }
  };

  const showError = (field) => touched[field] && errors[field];

  const useIdentifiedName = () => {
    if (!aiAnalysis?.identifiedFoodName) return;
    const next = { ...form, foodName: aiAnalysis.identifiedFoodName };
    setForm(next);
    if (onLiveChange) onLiveChange({ ...next, imageFile, imagePreviewUrl });
  };

  const descLength = form.description ? form.description.length : 0;
  const hasErrors = Object.keys(errors).length > 0 && Object.keys(touched).length > 0;

  return (
    <form className="fs-card fs-donate-form" onSubmit={handleSubmit} noValidate>
      {/* SECTION 1: FOOD DETAILS */}
      <section className="fs-form-section">
        <div className="fs-section-header">
          <div className="fs-section-icon-box">
            <Utensils size={18} />
          </div>
          <div>
            <h2 className="fs-section-title">Food Details</h2>
            <p className="fs-section-desc">
              Specify the food item and category so matching NGOs can identify it immediately.
            </p>
          </div>
        </div>

        <div className="fs-form-grid-2">
          {/* Food Category */}
          <div className="fs-field">
            <label htmlFor="category" className="fs-label">
              <span>Food Category</span>
              <span className="fs-required-mark" aria-hidden="true">*</span>
            </label>
            <div className="fs-input-affix-wrapper">
              <span className="fs-input-prefix-icon" aria-hidden="true">
                <Layers size={16} />
              </span>
              <select
                id="category"
                className={`fs-select fs-has-prefix ${showError("category") ? "fs-input-error" : ""}`}
                value={form.category}
                onChange={handleChange("category")}
                onBlur={handleBlur("category")}
                aria-invalid={!!showError("category")}
                aria-describedby={showError("category") ? "category-error" : "category-hint"}
              >
                <option value="">Select food category</option>
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {showError("category") ? (
              <span id="category-error" className="fs-error-text" role="alert">
                <AlertCircle size={14} /> {errors.category}
              </span>
            ) : (
              <span id="category-hint" className="fs-hint-text">
                Category helps NGOs filter for dietary suitability
              </span>
            )}
          </div>

          {/* Food Name */}
          <div className="fs-field">
            <label htmlFor="foodName" className="fs-label">
              <span>Food Item Name</span>
              <span className="fs-required-mark" aria-hidden="true">*</span>
            </label>
            <div className="fs-input-affix-wrapper">
              <span className="fs-input-prefix-icon" aria-hidden="true">
                <Utensils size={16} />
              </span>
              <input
                id="foodName"
                type="text"
                className={`fs-input fs-has-prefix ${showError("foodName") ? "fs-input-error" : ""}`}
                placeholder="e.g. Steamed Rice, Vegetable Curry, Bread"
                value={form.foodName}
                onChange={handleChange("foodName")}
                onBlur={handleBlur("foodName")}
                aria-invalid={!!showError("foodName")}
                aria-describedby={showError("foodName") ? "foodName-error" : "foodName-hint"}
              />
            </div>
            {showError("foodName") ? (
              <span id="foodName-error" className="fs-error-text" role="alert">
                <AlertCircle size={14} /> {errors.foodName}
              </span>
            ) : (
              <span id="foodName-hint" className="fs-hint-text">
                Be specific (e.g. "Paneer Biryani" rather than just "Food")
              </span>
            )}
          </div>
        </div>

        {/* Description & Character Counter */}
        <div className="fs-field fs-field-mt">
          <div className="fs-label-row">
            <label htmlFor="description" className="fs-label">
              <span>Food Description &amp; Allergen Notes</span>
              <span className="fs-optional-badge">Optional</span>
            </label>
            <span
              className={`fs-char-counter ${
                descLength > MAX_DESCRIPTION_LENGTH ? "fs-char-limit-exceeded" : ""
              }`}
              aria-live="polite"
            >
              {descLength}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <div className="fs-input-affix-wrapper">
            <textarea
              id="description"
              className="fs-textarea"
              placeholder="Mention ingredients, packaging method, allergens (nuts, dairy, gluten), or whether it is vegetarian..."
              value={form.description}
              onChange={handleChange("description")}
              maxLength={MAX_DESCRIPTION_LENGTH + 50}
              aria-describedby="description-hint"
            />
          </div>
          <span id="description-hint" className="fs-hint-text">
            Helps volunteers handle food storage and distribution safely.
          </span>
        </div>
      </section>

      {/* SECTION 2: QUANTITY & TIMING */}
      <section className="fs-form-section">
        <div className="fs-section-header">
          <div className="fs-section-icon-box">
            <Scale size={18} />
          </div>
          <div>
            <h2 className="fs-section-title">Quantity &amp; Shelf-Life Timing</h2>
            <p className="fs-section-desc">
              Accurate timing enables FoodSaver AI to calculate precise freshness and consumption windows.
            </p>
          </div>
        </div>

        {/* Quantity Field */}
        <div className="fs-quantity-row">
          <div className="fs-field">
            <label htmlFor="quantity" className="fs-label">
              <span>Quantity</span>
              <span className="fs-required-mark" aria-hidden="true">*</span>
            </label>
            <div className="fs-composite-input">
              <input
                id="quantity"
                type="number"
                min="0.1"
                step="any"
                className={`fs-input ${showError("quantity") ? "fs-input-error" : ""}`}
                placeholder="e.g. 10"
                value={form.quantity}
                onChange={handleChange("quantity")}
                onBlur={handleBlur("quantity")}
                aria-invalid={!!showError("quantity")}
              />
              <select
                id="unit"
                className="fs-select fs-select-unit"
                value={form.unit}
                onChange={handleChange("unit")}
                aria-label="Unit of measure"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            {showError("quantity") && (
              <span className="fs-error-text" role="alert">
                <AlertCircle size={14} /> {errors.quantity}
              </span>
            )}
          </div>
        </div>

        {/* Preparation Date/Time (Left) & Expiry Date/Time (Right) as two equal-sized boxes side by side */}
        <div className="fs-timing-grid">
          {/* Preparation Field (Left Box) */}
          <div className="fs-timing-box">
            <div className="fs-timing-box__header">
              <label htmlFor="preparationDate" className="fs-label">
                <Calendar size={15} />
                <span>Preparation Date &amp; Time</span>
                <span className="fs-required-mark" aria-hidden="true">*</span>
              </label>
            </div>

            <div className="fs-timing-subgrid">
              <div className="fs-field">
                <div className="fs-input-affix-wrapper">
                  <span className="fs-input-prefix-icon" aria-hidden="true">
                    <Calendar size={16} />
                  </span>
                  <input
                    id="preparationDate"
                    type="date"
                    className={`fs-input fs-has-prefix ${showError("preparationDate") ? "fs-input-error" : ""}`}
                    value={form.preparationDate}
                    onChange={handleChange("preparationDate")}
                    onBlur={handleBlur("preparationDate")}
                    aria-invalid={!!showError("preparationDate")}
                    title="Preparation Date"
                  />
                </div>
              </div>

              <div className="fs-field">
                <div className="fs-input-affix-wrapper">
                  <span className="fs-input-prefix-icon" aria-hidden="true">
                    <Clock size={16} />
                  </span>
                  <input
                    id="preparationTime"
                    type="time"
                    className={`fs-input fs-has-prefix ${showError("preparationTime") ? "fs-input-error" : ""}`}
                    value={form.preparationTime}
                    onChange={handleChange("preparationTime")}
                    onBlur={handleBlur("preparationTime")}
                    aria-invalid={!!showError("preparationTime")}
                    title="Preparation Time"
                  />
                </div>
              </div>
            </div>

            {(showError("preparationDate") || showError("preparationTime")) && (
              <span className="fs-error-text" role="alert">
                <AlertCircle size={14} /> {errors.preparationDate || errors.preparationTime}
              </span>
            )}
          </div>

          {/* Expiry Field (Right Box) */}
          <div className="fs-timing-box">
            <div className="fs-timing-box__header">
              <label htmlFor="expirationDate" className="fs-label fs-label--readonly">
                <Sparkles size={15} className="fs-sparkle-gold" />
                <span>Expiry Date &amp; Time</span>
                <span className="fs-readonly-badge">AI Calculated</span>
              </label>
            </div>

            <div className="fs-timing-subgrid">
              <div className="fs-field">
                <div className="fs-input-affix-wrapper">
                  <span className="fs-input-prefix-icon fs-prefix-green" aria-hidden="true">
                    <Calendar size={16} />
                  </span>
                  <input
                    id="expirationDate"
                    type="text"
                    className="fs-input fs-has-prefix fs-ai-generated-field"
                    value={displayDate(expiry.date)}
                    readOnly
                    placeholder={aiLoading ? "Calculating..." : "Calculated by AI"}
                    aria-label="AI estimated expiry date (read only)"
                    title="Estimated Expiry Date"
                  />
                </div>
              </div>

              <div className="fs-field">
                <div className="fs-input-affix-wrapper">
                  <span className="fs-input-prefix-icon fs-prefix-green" aria-hidden="true">
                    <Clock size={16} />
                  </span>
                  <input
                    id="expirationTime"
                    type="text"
                    className="fs-input fs-has-prefix fs-ai-generated-field"
                    value={displayTime(expiry.time)}
                    readOnly
                    placeholder={aiLoading ? "Calculating..." : "Calculated by AI"}
                    aria-label="AI estimated expiry time (read only)"
                    title="Estimated Expiry Time"
                  />
                </div>
              </div>
            </div>

            <span className="fs-hint-text fs-hint-green">
              {aiLoading ? "Calculating freshness..." : "Automatically estimated by FoodSaver AI."}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3: AI SHELF-LIFE INTELLIGENCE */}
      <section className="fs-form-section fs-section--ai">
        <div className="fs-section-header">
          <div className="fs-section-icon-box fs-section-icon-box--ai">
            <Sparkles size={18} />
          </div>
          <div className="fs-section-header-grow">
            <div className="fs-section-title-wrap">
              <h2 className="fs-section-title">FoodSaver AI Shelf-Life Assessment</h2>
              <span className="fs-badge fs-badge--ai-active">Auto Calculation</span>
            </div>
            <p className="fs-section-desc">
              Estimates safe consumption hours using item characteristics and prep timestamps.
            </p>
          </div>
        </div>

        {/* Live AI Status / Diagnostics Box */}
        <div className="fs-ai-status-card" aria-live="polite">
          {aiLoading && (
            <div className="fs-ai-status-row fs-ai-status-loading">
              <div className="fs-spinner fs-spinner-green" />
              <span>AI is estimating freshness and remaining safe shelf life...</span>
            </div>
          )}

          {!aiLoading && aiAnalysis && (
            <div className="fs-ai-status-row fs-ai-status-success">
              <div className="fs-ai-status-pill">
                <ShieldCheck size={15} />
                <span>Identified: <strong>{aiAnalysis.foodName || aiAnalysis.foodType}</strong></span>
              </div>
              <div className="fs-ai-status-pill">
                <span>Freshness: <strong>{aiAnalysis.freshness}</strong></span>
              </div>
              <div className="fs-ai-status-pill">
                <span>Confidence: <strong>{Math.round((aiAnalysis.confidence || 0) * (aiAnalysis.confidence <= 1 ? 100 : 1))}%</strong></span>
              </div>
            </div>
          )}

          {!aiLoading && !aiAnalysis && !aiError && (
            <div className="fs-ai-status-row fs-ai-status-idle">
              <Info size={16} />
              <span>Fill in food name, category, and preparation time to preview AI shelf-life estimate.</span>
            </div>
          )}

          {!aiLoading && aiError && (
            <div className="fs-ai-inline-error" role="alert">
              <div className="fs-ai-error-msg">
                <AlertCircle size={16} />
                <span>{aiError}</span>
              </div>
              {onRetry && (
                <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={onRetry}>
                  Try Again
                </button>
              )}
            </div>
          )}

          {!aiLoading && conflictPending && (
            <div className="fs-ai-conflict-banner" role="alert">
              <div className="fs-ai-conflict-text">
                <AlertCircle size={18} className="fs-ai-conflict-icon" />
                <div>
                  <strong>Photo Mismatch Detected</strong>
                  <p>
                    Uploaded photo resembles <em>"{aiAnalysis.identifiedFoodName}"</em>, but you typed <em>"{form.foodName}"</em>.
                  </p>
                </div>
              </div>
              <div className="fs-ai-conflict-actions">
                <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={onKeepEntry}>
                  Keep "{form.foodName}"
                </button>
                <button type="button" className="fs-btn fs-btn-primary fs-btn-sm" onClick={useIdentifiedName}>
                  Use "{aiAnalysis.identifiedFoodName}"
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: PICKUP LOCATION */}
      <section className="fs-form-section">
        <div className="fs-section-header">
          <div className="fs-section-icon-box">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="fs-section-title">Pickup Location</h2>
            <p className="fs-section-desc">
              Address or landmark where the NGO volunteer will collect the food safely.
            </p>
          </div>
        </div>

        <div className="fs-field">
          <label htmlFor="location" className="fs-label">
            <span>Address / Landmark</span>
            <span className="fs-required-mark" aria-hidden="true">*</span>
          </label>
          <div className="fs-input-affix-wrapper">
            <span className="fs-input-prefix-icon" aria-hidden="true">
              <MapPin size={16} />
            </span>
            <input
              id="location"
              type="text"
              className={`fs-input fs-has-prefix ${showError("location") ? "fs-input-error" : ""}`}
              placeholder="e.g. 14 Market Road, Ongole, Andhra Pradesh"
              value={form.location}
              onChange={handleChange("location")}
              onBlur={handleBlur("location")}
              aria-invalid={!!showError("location")}
              aria-describedby={showError("location") ? "location-error" : "location-hint"}
            />
          </div>
          {showError("location") ? (
            <span id="location-error" className="fs-error-text" role="alert">
              <AlertCircle size={14} /> {errors.location}
            </span>
          ) : (
            <span id="location-hint" className="fs-hint-text">
              Include flat/building number, street name, and identifiable landmarks.
            </span>
          )}
        </div>
      </section>

      {/* SECTION 5: FOOD PHOTO */}
      <section className="fs-form-section">
        <div className="fs-section-header">
          <div className="fs-section-icon-box">
            <Camera size={18} />
          </div>
          <div>
            <h2 className="fs-section-title">Food Photo</h2>
            <p className="fs-section-desc">
              Optional but highly recommended — allows Gemini AI to visually verify freshness and builds trust with NGOs.
            </p>
          </div>
        </div>

        <div className="fs-field">
          <FoodImageUpload
            image={imageFile}
            previewUrl={imagePreviewUrl}
            onImageSelect={(file) => {
              const url = URL.createObjectURL(file);
              handleImageChange(file, url);
              setTouched((prev) => ({ ...prev, image: true }));
            }}
            onImageRemove={() => {
              if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
              handleImageChange(null, null);
              setTouched((prev) => ({ ...prev, image: true }));
            }}
            error={showError("image") ? errors.image : ""}
          />
        </div>
      </section>

      {/* SUBMISSION FOOTER */}
      <div className="fs-form-footer">
        <div className="fs-footer-note">
          <CheckCircle2 size={16} className="fs-footer-check-icon" />
          <span>Every field is checked by FoodSaver AI before publishing to nearby NGOs.</span>
        </div>

        <button
          type="submit"
          className="fs-btn fs-btn-primary fs-btn-next"
          disabled={conflictPending}
        >
          <span>Continue to AI Analysis</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {hasErrors && (
        <div className="fs-form-summary-error" role="alert">
          <AlertCircle size={16} />
          <span>Please fill in all required fields marked with an asterisk before proceeding.</span>
        </div>
      )}
    </form>
  );
}
