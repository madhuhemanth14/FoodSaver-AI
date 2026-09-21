import "./AdminNavbar.css";

/**
 * Top bar for the admin shell.
 * @param {{ adminName?: string, notificationCount?: number }} props
 */
const AdminNavbar = ({ adminName = "Admin", notificationCount = 0 }) => {
  return (
    <header className="admin-navbar">
      <div className="admin-navbar__title">Admin Panel</div>

      <div className="admin-navbar__right">
        <button
          type="button"
          className="admin-navbar__bell"
          aria-label={`${notificationCount} notifications`}
        >
          🔔
          {notificationCount > 0 && (
            <span className="admin-navbar__badge">{notificationCount}</span>
          )}
        </button>

        <div className="admin-navbar__avatar" aria-hidden="true">
          {adminName.charAt(0).toUpperCase()}
        </div>
        <span className="admin-navbar__name">{adminName}</span>
      </div>
    </header>
  );
};

export default AdminNavbar;
