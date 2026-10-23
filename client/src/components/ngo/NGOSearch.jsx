import { Search, X } from "lucide-react";
import "../../styles/ngo-search.css";

/**
 * NGOSearch
 *
 * Reusable text search input with a clear button.
 *
 * Props:
 *  - value: string
 *  - onChange: (value: string) => void
 *  - placeholder?: string
 */
export default function NGOSearch({ value, onChange, placeholder = "Search NGOs..." }) {
  return (
    <div className="ngo-search">
      <span className="ngo-search__icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Search size={16} color="var(--fs-text-muted, #5c6b5e)" />
      </span>
      <input
        type="text"
        className="ngo-search__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search NGOs by name, location, or food type"
      />
      {value && (
        <button
          type="button"
          className="ngo-search__clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
