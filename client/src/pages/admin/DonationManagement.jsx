import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import FilterPanel from "../../components/admin/FilterPanel";
import DataTable from "../../components/admin/DataTable";
import { getDonations } from "../../services/adminService";
import "./DonationManagement.css";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "All Categories" },
  { value: "Cooked Food", label: "Cooked Food" },
  { value: "Rice", label: "Rice" },
  { value: "Vegetables", label: "Vegetables" },
  { value: "Fruits", label: "Fruits" },
  { value: "Bakery", label: "Bakery" },
  { value: "Packaged Food", label: "Packaged Food" },
  { value: "Other", label: "Other" },
];

/**
 * DonationManagement
 * Route: /admin/donations
 */
function DonationManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    getDonations().then((data) => {
      setDonations(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      const matchesSearch =
        !search ||
        d.food.toLowerCase().includes(search.toLowerCase()) ||
        d.donor.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "ALL" || d.status === status;
      const matchesCategory = category === "ALL" || d.category === category;
      const matchesDate = !date || d.date === date;
      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [donations, search, status, category, date]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: "id", label: "Donation ID" },
    { key: "food", label: "Food" },
    { key: "donor", label: "Donor" },
    { key: "quantity", label: "Quantity" },
    { key: "category", label: "Category" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`donation-status donation-status--${row.status.toLowerCase()}`}>
          {row.status.replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    { key: "ngo", label: "NGO" },
    { key: "pickup", label: "Pickup" },
  ];

  return (
    <div className="admin-layout donation-management">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName="Admin" notificationCount={3} />
        <main className="admin-layout__content">
          <div className="admin-page-header">
            <h1>Donation Management</h1>
            <p>Monitor every donation from listing through pickup.</p>
          </div>

          <FilterPanel
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search by food or donor…"
            filters={[
              {
                key: "status",
                label: "Status",
                value: status,
                options: STATUS_OPTIONS,
                onChange: (v) => {
                  setStatus(v);
                  setPage(1);
                },
              },
              {
                key: "category",
                label: "Category",
                value: category,
                options: CATEGORY_OPTIONS,
                onChange: (v) => {
                  setCategory(v);
                  setPage(1);
                },
              },
            ]}
            dateValue={date}
            onDateChange={(v) => {
              setDate(v);
              setPage(1);
            }}
          />

          <DataTable
            columns={columns}
            rows={paged}
            loading={loading}
            emptyMessage="No donations match your filters."
            getRowActions={(row) => (
              <button type="button" className="row-actions__btn" onClick={() => setSelectedDonation(row)}>
                View
              </button>
            )}
          />

          {!loading && filtered.length > 0 && (
            <div className="pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedDonation && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedDonation(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Donation details" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedDonation.food}</h2>
            <dl className="admin-modal__list">
              <dt>Donation ID</dt>
              <dd>{selectedDonation.id}</dd>
              <dt>Donor</dt>
              <dd>{selectedDonation.donor}</dd>
              <dt>Quantity</dt>
              <dd>{selectedDonation.quantity}</dd>
              <dt>Category</dt>
              <dd>{selectedDonation.category}</dd>
              <dt>Status</dt>
              <dd>{selectedDonation.status.replace(/_/g, " ")}</dd>
              <dt>Date</dt>
              <dd>{selectedDonation.date}</dd>
              <dt>NGO</dt>
              <dd>{selectedDonation.ngo}</dd>
              <dt>Pickup</dt>
              <dd>{selectedDonation.pickup}</dd>
            </dl>
            <button type="button" className="row-actions__btn" onClick={() => setSelectedDonation(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationManagement;
