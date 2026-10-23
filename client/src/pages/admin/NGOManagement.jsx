import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import FilterPanel from "../../components/admin/FilterPanel";
import DataTable from "../../components/admin/DataTable";
import { deleteNGO, getNGOs, updateNGOStatus } from "../../services/adminService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import "./NGOManagement.css";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Verification" },
  { value: "VERIFIED", label: "Verified" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

function toVerification(ngo) {
  if (ngo.verified) return "VERIFIED";
  if (ngo.status === "Closed" && !ngo.verified) return "PENDING";
  return "PENDING";
}

function normalizeNgo(ngo) {
  return {
    ...ngo,
    id: ngo._id,
    locationText: [ngo.city, ngo.state].filter(Boolean).join(", ") || ngo.address || "Not set",
    contact: ngo.email || ngo.phone || "Not set",
    verification: toVerification(ngo),
    accountStatus: ngo.status || "Closed",
  };
}

function NGOManagement() {
  const { user } = useAuth();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [actionError, setActionError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNgos = async () => {
    setLoading(true);
    try {
      const data = await getNGOs();
      setNgos((Array.isArray(data) ? data : []).map(normalizeNgo));
      setActionError("");
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to load NGOs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgos();
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  const locationOptions = useMemo(() => {
    const unique = Array.from(new Set(ngos.map((n) => n.locationText).filter(Boolean)));
    return [{ value: "ALL", label: "All Locations" }, ...unique.map((loc) => ({ value: loc, label: loc }))];
  }, [ngos]);

  const filtered = useMemo(() => {
    return ngos.filter((n) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || [n.name, n.email, n.phone, n.locationText].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesStatus = status === "ALL" || n.verification === status;
      const matchesLocation = location === "ALL" || n.locationText === location;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [ngos, search, status, location]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleVerification = async (ngo, nextVerification) => {
    const action = nextVerification === "VERIFIED" ? "approve" : "reject";
    if (!window.confirm(`${action === "approve" ? "Approve" : "Reject"} ${ngo.name}?`)) return;

    try {
      const updated = await updateNGOStatus(ngo.id, { verified: nextVerification === "VERIFIED" });
      setNgos((prev) => prev.map((item) => item.id === ngo.id ? normalizeNgo(updated) : item));
      if (selectedNgo?.id === ngo.id) setSelectedNgo(normalizeNgo(updated));
    } catch (error) {
      setActionError(error.response?.data?.message || `Failed to ${action} NGO.`);
    }
  };

  const handleDelete = async (ngo) => {
    const confirmed = window.confirm(
      `Delete ${ngo.name}? This permanently removes the NGO organization and its linked NGO login account. This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteNGO(ngo.id);
      setNgos((prev) => prev.filter((item) => item.id !== ngo.id));
      setSelectedNgo(null);
      setActionError("");
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to delete NGO account.");
    }
  };

  const columns = [
    { key: "id", label: "NGO ID", render: (row) => String(row.id).slice(-8) },
    { key: "name", label: "Name" },
    { key: "locationText", label: "Location" },
    { key: "contact", label: "Contact" },
    {
      key: "verification",
      label: "Verification",
      render: (row) => (
        <span className={`verification-badge verification-badge--${row.verification.toLowerCase()}`}>
          {row.verification}
        </span>
      ),
    },
    {
      key: "accountStatus",
      label: "Account Status",
      render: (row) => <span className={`ngo-status ngo-status--${row.accountStatus.toLowerCase()}`}>{row.accountStatus}</span>,
    },
  ];

  return (
    <div className="admin-layout ngo-management">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName={user?.name || "Admin"} notificationCount={unreadCount} />
        <main className="admin-layout__content">
          <div className="admin-page-header">
            <div>
              <h1>NGO Management</h1>
              <p>Verify NGOs, monitor accounts, and delete an NGO account when required.</p>
            </div>
          </div>

          {actionError && <div className="admin-action-error" role="alert">{actionError}</div>}

          <FilterPanel
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search NGO name, email, phone…"
            filters={[
              {
                key: "status",
                label: "Verification",
                value: status,
                options: STATUS_OPTIONS,
                onChange: (v) => { setStatus(v); setPage(1); },
              },
              {
                key: "location",
                label: "Location",
                value: location,
                options: locationOptions,
                onChange: (v) => { setLocation(v); setPage(1); },
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
                <button type="button" className="row-actions__btn" onClick={() => setSelectedNgo(row)}>View</button>
                {row.verification !== "VERIFIED" && (
                  <button type="button" className="row-actions__btn row-actions__btn--positive" onClick={() => handleVerification(row, "VERIFIED")}>Approve</button>
                )}
                {row.verification === "VERIFIED" && (
                  <button type="button" className="row-actions__btn row-actions__btn--danger" onClick={() => handleVerification(row, "REJECTED")}>Reject</button>
                )}
                <button type="button" className="row-actions__btn row-actions__btn--danger" onClick={() => handleDelete(row)}>Delete Account</button>
              </div>
            )}
          />

          {!loading && filtered.length > 0 && (
            <div className="pagination">
              <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </main>
      </div>

      {selectedNgo && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedNgo(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label="NGO details" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedNgo.name}</h2>
            <dl className="admin-modal__list">
              <dt>NGO ID</dt><dd>{selectedNgo.id}</dd>
              <dt>Email</dt><dd>{selectedNgo.email || "Not set"}</dd>
              <dt>Phone</dt><dd>{selectedNgo.phone || "Not set"}</dd>
              <dt>Address</dt><dd>{selectedNgo.address || "Not set"}</dd>
              <dt>Location</dt><dd>{selectedNgo.locationText}</dd>
              <dt>Verification</dt><dd>{selectedNgo.verification}</dd>
              <dt>Status</dt><dd>{selectedNgo.accountStatus}</dd>
            </dl>
            <div className="row-actions">
              <button type="button" className="row-actions__btn" onClick={() => setSelectedNgo(null)}>Close</button>
              <button type="button" className="row-actions__btn row-actions__btn--danger" onClick={() => handleDelete(selectedNgo)}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NGOManagement;
