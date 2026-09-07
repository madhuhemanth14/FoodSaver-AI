import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import FilterPanel from "../../components/admin/FilterPanel";
import DataTable from "../../components/admin/DataTable";
import { getUsers } from "../../services/adminService";
import "./UserManagement.css";

const PAGE_SIZE = 6;

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "DONOR", label: "Donor" },
  { value: "NGO", label: "NGO" },
  { value: "ADMIN", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PENDING", label: "Pending" },
];

/**
 * UserManagement
 * Route: /admin/users
 *
 * Block/unblock actions here are frontend mock UI only — no real backend
 * mutation is performed. A confirmation prompt is shown before "changing"
 * status, and the change is applied to local state only.
 */
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === "ALL" || u.role === role;
      const matchesStatus = status === "ALL" || u.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    const confirmed = window.confirm(
      `${nextStatus === "BLOCKED" ? "Block" : "Unblock"} ${user.name}? This is a demo action only — no backend change will be made.`
    );
    if (!confirmed) return;

    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => <span className={`role-badge role-badge--${row.role.toLowerCase()}`}>{row.role}</span>,
    },
    { key: "location", label: "Location" },
    {
      key: "status",
      label: "Status",
      render: (row) => <span className={`status-badge status-badge--${row.status.toLowerCase()}`}>{row.status}</span>,
    },
    { key: "joinedDate", label: "Joined Date" },
  ];

  return (
    <div className="admin-layout user-management">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName="Admin" notificationCount={3} />
        <main className="admin-layout__content">
          <div className="admin-page-header">
            <h1>User Management</h1>
            <p>View and manage donor, NGO, and admin accounts.</p>
          </div>

          <FilterPanel
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search by name or email…"
            filters={[
              {
                key: "role",
                label: "Role",
                value: role,
                options: ROLE_OPTIONS,
                onChange: (v) => {
                  setRole(v);
                  setPage(1);
                },
              },
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
            ]}
          />

          <DataTable
            columns={columns}
            rows={pagedUsers}
            loading={loading}
            emptyMessage="No users match your filters."
            getRowActions={(row) => (
              <div className="row-actions">
                <button type="button" className="row-actions__btn" onClick={() => setSelectedUser(row)}>
                  View
                </button>
                <button
                  type="button"
                  className={`row-actions__btn ${row.status === "BLOCKED" ? "row-actions__btn--positive" : "row-actions__btn--danger"}`}
                  onClick={() => handleToggleStatus(row)}
                >
                  {row.status === "BLOCKED" ? "Unblock" : "Block"}
                </button>
              </div>
            )}
          />

          {!loading && filteredUsers.length > 0 && (
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

      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label="User details" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedUser.name}</h2>
            <dl className="admin-modal__list">
              <dt>ID</dt>
              <dd>{selectedUser.id}</dd>
              <dt>Email</dt>
              <dd>{selectedUser.email}</dd>
              <dt>Role</dt>
              <dd>{selectedUser.role}</dd>
              <dt>Location</dt>
              <dd>{selectedUser.location}</dd>
              <dt>Status</dt>
              <dd>{selectedUser.status}</dd>
              <dt>Joined</dt>
              <dd>{selectedUser.joinedDate}</dd>
            </dl>
            <button type="button" className="row-actions__btn" onClick={() => setSelectedUser(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
