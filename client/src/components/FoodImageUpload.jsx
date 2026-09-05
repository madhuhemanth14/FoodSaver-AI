import { useCallback, useRef, useState } from "react";
import "../styles/food-analysis.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 8;

/**
 * Upload widget for a single food image: click-to-browse, drag & drop,
 * preview, replace, and remove.
 *
 * @param {File|null} image - currently selected file
 * @param {string|null} previewUrl - object URL for preview
 * @param {(file: File) => void} onImageSelect
 * @param {() => void} onImageRemove
 */
const FoodImageUpload = ({ image, previewUrl, onImageSelect, onImageRemove }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const validateAndSelect = useCallback(
    (file) => {
      setError("");
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Please upload a JPG, PNG, or WEBP image.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
        return;
      }
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelect(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const openFileDialog = () => inputRef.current?.click();

  if (image && previewUrl) {
    return (
      <div className="fa-upload fa-upload--filled">
        <img src={previewUrl} alt="Uploaded food preview" className="fa-upload__preview" />
        <div className="fa-upload__actions">
          <button type="button" className="fa-btn fa-btn--ghost" onClick={openFileDialog}>
            Replace
          </button>
          <button type="button" className="fa-btn fa-btn--ghost fa-btn--danger" onClick={onImageRemove}>
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          hidden
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className={`fa-upload fa-upload--empty ${isDragging ? "is-dragging" : ""}`}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFileDialog()}
      >
        <span className="fa-upload__icon" aria-hidden="true">📷</span>
        <p className="fa-upload__title">Upload Food Image</p>
        <p className="fa-upload__hint">Drag &amp; drop or browse</p>
        <p className="fa-upload__formats">JPG, PNG, WEBP</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          hidden
        />
      </div>
      {error && <p className="fa-upload__error">{error}</p>}
    </div>
  );
};

export default FoodImageUpload;
