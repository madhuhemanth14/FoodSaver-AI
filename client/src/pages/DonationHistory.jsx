import React, { useEffect, useMemo, useState } from "react";
import FoodCard from "../components/FoodCard";
import DonationFilters from "../components/DonationFilters";
import EmptyDonations from "../components/EmptyDonations";
import donationService from "../services/donationService";
import "../styles/donation-theme.css";
import "../styles/donation-components.css";
import "../styles/DonationHistory.css";

/**
 * DonationHistory (Member 3)
 * Lists the current donor's donations (mock data for now) with search,
 * status filtering and sorting.
 */
export default function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    donationService.getMyDonations().then((data) => {
      if (!cancelled) {
        setDonations(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDonations = useMemo(() => {
    let result = [...donations];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.foodName.toLowerCase().includes(query) ||
          d.location.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((d) => d.status === statusFilter);
    }

    result.sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return sortOrder === "newest" ? -diff : diff;
    });

    return result;
  }, [donations, search, statusFilter, sortOrder]);

  const hasAnyDonations = donations.length > 0;
  const hasFiltersApplied = search.trim() !== "" || statusFilter !== "ALL";

  return (
    <div className="fs-module fs-history-page">
      <div className="fs-container">
        <div className="fs-page-header">
          <h1>My Donations</h1>
          <p className="fs-subtitle">Track the food you've shared with the community.</p>
        </div>

        {hasAnyDonations && (
          <DonationFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        )}

        {loading && (
          <div className="fs-history-skeleton-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="fs-skeleton fs-history-skeleton-card" />
            ))}
          </div>
        )}

        {!loading && !hasAnyDonations && <EmptyDonations />}

        {!loading && hasAnyDonations && filteredDonations.length === 0 && (
          <EmptyDonations
            title="No matching donations"
            message="Try a different search term or clear your filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
          />
        )}

        {!loading && filteredDonations.length > 0 && (
          <>
            <p className="fs-history-count">
              {filteredDonations.length} donation{filteredDonations.length !== 1 ? "s" : ""}
              {hasFiltersApplied ? " found" : ""}
            </p>
            <div className="fs-food-grid">
              {filteredDonations.map((donation) => (
                <FoodCard key={donation.id} donation={donation} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
