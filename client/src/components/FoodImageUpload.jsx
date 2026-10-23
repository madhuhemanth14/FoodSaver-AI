import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
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
const FoodImageUpload = ({ image, previewUrl, onImageSelect, onImageRemove, error: externalError }) => {
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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  if (image && previewUrl) {
    return (
      <div className="fa-upload fa-upload--filled">
        <div className="fa-upload__preview-wrapper">
          <img src={previewUrl} alt="Uploaded food preview" className="fa-upload__preview" />
          <div className="fa-upload__meta-chip">
            <CheckCircle2 size={13} strokeWidth={2.5} />
            <span className="fa-upload__meta-name">{image.name || "Food Photo"}</span>
            {image.size && <span className="fa-upload__meta-size">({formatFileSize(image.size)})</span>}
          </div>
        </div>

        <div className="fa-upload__actions">
          <button type="button" className="fa-btn fa-btn--ghost" onClick={openFileDialog}>
            <RefreshCw size={14} /> Replace
          </button>
          <button type="button" className="fa-btn fa-btn--ghost fa-btn--danger" onClick={onImageRemove}>
            <Trash2 size={14} /> Remove
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
    <div className="fa-upload-container">
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
        <div className="fa-upload__icon-wrap">
          <UploadCloud size={28} className="fa-upload__icon" aria-hidden="true" />
        </div>
        <p className="fa-upload__title">Upload Food Image</p>
        <p className="fa-upload__hint">Drag &amp; drop an image here, or <span className="fa-upload__browse">browse files</span></p>
        <div className="fa-upload__formats-tag">
          <ImageIcon size={12} />
          <span>JPG, PNG, WEBP &bull; Max 8MB</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          hidden
        />
      </div>
      {(error || externalError) && (
        <p className="fa-upload__error">
          <AlertCircle size={14} /> {error || externalError}
        </p>
      )}
    </div>
  );
};

export default FoodImageUpload;

