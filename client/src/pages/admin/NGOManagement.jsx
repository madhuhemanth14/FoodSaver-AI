import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import FilterPanel from "../../components/admin/FilterPanel";
import DataTable from "../../components/admin/DataTable";
import { getNGOs } from "../../services/adminService";
import "./NGOManagement.css";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "VERIFIED", label: "Verified" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

/**
 * NGOManagement
 * Route: /admin/ngos
 *
 * Approve/Reject actions are frontend mock UI only — no backend
 * authorization is implemented here.
 */
function NGOManagement() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedNgo, setSelectedNgo] = useState(null);

  useEffect(() => {
    getNGOs().then((data) => {
      setNgos(data);
      setLoading(false);
    });
  }, []);

  const locationOptions = useMemo(() => {
    const unique = Array.from(new Set(ngos.map((n) => n.location)));
    return [{ value: "ALL", label: "All Locations" }, ...unique.map((loc) => ({ value: loc, label: loc }))];
  }, [ngos]);

  const filtered = useMemo(() => {
    return ngos.filter((n) => {
      const matchesSearch = !search || n.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "ALL" || n.verification === status;
      const matchesLocation = location === "ALL" || n.location === location;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [ngos, search, status, location]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleVerification = (ngo, nextVerification) => {
    const confirmed = window.confirm(
      `${nextVerification === "VERIFIED" ? "Approve" : "Reject"} ${ngo.name}? This is a demo action only — no backend change will be made.`
    );
    if (!confirmed) return;

    setNgos((prev) => prev.map((n) => (n.id === ngo.id ? { ...n, verification: nextVerification } : n)));
  };

  const columns = [
    { key: "id", label: "NGO ID" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location" },
    { key: "contact", label: "Contact" },
    {
      key: "verification",
      label: "Verification Status",
      render: (row) => (
        <span className={`verification-badge verification-badge--${row.verification.toLowerCase()}`}>
          {row.verification}
        </span>
      ),
    },
    { key: "donationsReceived", label: "Donations Received" },
    { key: "pickups", label: "Pickups" },
    {
      key: "status",
      label: "Status",
      render: (row) => <span className={`ngo-status ngo-status--${row.status.toLowerCase()}`}>{row.status}</span>,
    },
  ];

  return (
    <div className="admin-layout ngo-management">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName="Admin" notificationCount={3} />
        <main className="admin-layout__content">
          <div className="admin-page-header">
            <h1>NGO Management</h1>
            <p>Verify NGOs and monitor their donation and pickup activity.</p>
          </div>

          <FilterPanel
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search NGOs by name…"
            filters={[
              {
                key: "status",
                label: "Verification",
                value: status,
                options: STATUS_OPTIONS,
                onChange: (v) => {
                  setStatus(v);
                  setPage(1);
                },
              },
              {
                key: "location",
                label: "Location",
                value: location,
                options: locationOptions,
                onChange: (v) => {
                  setLocation(v);
                  setPage(1);
                },
              },
            ]}
          />

          <DataTable
            columns={columns}
            rows={paged}
            loading={loading}
            emptyMessage="No NGOs match your filters."
            getRowActions={(row) => (
              <div className="row-actions">
                <button type="button" className="row-actions__btn" onClick={() => setSelectedNgo(row)}>
                  View
                </button>
                {row.verification !== "VERIFIED" && (
                  <button
                    type="button"
                    className="row-actions__btn row-actions__btn--positive"
                    onClick={() => handleVerification(row, "VERIFIED")}
                  >
                    Approve
                  </button>
                )}
                {row.verification !== "REJECTED" && (
                  <button
                    type="button"
                    className="row-actions__btn row-actions__btn--danger"
                    onClick={() => handleVerification(row, "REJECTED")}
                  >
                    Reject
                  </button>
                )}
              </div>
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

      {selectedNgo && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedNgo(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label="NGO details" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedNgo.name}</h2>
            <dl className="admin-modal__list">
              <dt>NGO ID</dt>
              <dd>{selectedNgo.id}</dd>
              <dt>Location</dt>
              <dd>{selectedNgo.location}</dd>
              <dt>Contact</dt>
              <dd>{selectedNgo.contact}</dd>
              <dt>Verification</dt>
              <dd>{selectedNgo.verification}</dd>
              <dt>Donations Received</dt>
              <dd>{selectedNgo.donationsReceived}</dd>
              <dt>Pickups</dt>
              <dd>{selectedNgo.pickups}</dd>
              <dt>Status</dt>
              <dd>{selectedNgo.status}</dd>
            </dl>
            <button type="button" className="row-actions__btn" onClick={() => setSelectedNgo(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NGOManagement;
