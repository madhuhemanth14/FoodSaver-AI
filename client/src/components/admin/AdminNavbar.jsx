import { Link } from "react-router-dom";
import { Bell, Pencil } from "lucide-react";
import "./AdminNavbar.css";

/**
 * Admin top bar. The profile and notification controls are real navigation
 * links rather than decorative buttons.
 */
const AdminNavbar = ({ adminName = "Admin", notificationCount = 0 }) => {
  return (
    <header className="admin-navbar">
      <div className="admin-navbar__title">Admin Panel</div>

      <div className="admin-navbar__right">
        <Link
          to="/admin/notifications"
          className="admin-navbar__bell"
          aria-label={`${notificationCount} notifications`}
          title="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="admin-navbar__badge">{notificationCount}</span>
          )}
        </Link>

        <Link
          to="/admin/profile"
          className="admin-navbar__profile"
          title="Edit Profile"
          aria-label="Edit Profile"
        >
          <span className="admin-navbar__avatar" aria-hidden="true">
            {adminName.charAt(0).toUpperCase()}
          </span>
          <span className="admin-navbar__profile-text">
            <span className="admin-navbar__name">{adminName}</span>
            <span className="admin-navbar__edit-label"><Pencil size={11} /> Edit Profile</span>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default AdminNavbar;
