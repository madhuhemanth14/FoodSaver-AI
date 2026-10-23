import React from "react";
import { Search } from "lucide-react";
import { DONATION_STATUSES, STATUS_LABELS } from "../data/mockDonations";

/**
 * DonationFilters
 * Search + status filter + sort controls for the DonationHistory page.
 * Purely controlled — all filtering happens in the parent against mock
 * (or, later, API-fetched) data.
 *
 * Props:
 *  - search: string
 *  - onSearchChange: (value) => void
 *  - statusFilter: string ("ALL" or one of DONATION_STATUSES)
 *  - onStatusChange: (value) => void
 *  - sortOrder: "newest" | "oldest"
 *  - onSortChange: (value) => void
 */
export default function DonationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
}) {
  return (
    <div className="fs-filters">
      <div className="fs-filters-search">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          className="fs-input"
          placeholder="Search donations by food name or location"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search donations"
        />
      </div>

      <select
        className="fs-select"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="ALL">All statuses</option>
        {DONATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        className="fs-select"
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort donations"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
}
