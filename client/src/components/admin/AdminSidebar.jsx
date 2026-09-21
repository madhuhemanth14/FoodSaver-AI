import { NavLink } from "react-router-dom";
import "../../styles/admin-theme.css";
import "./AdminSidebar.css";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "◧", end: true },
  { to: "/admin/analytics", label: "Analytics", icon: "◈" },
  { to: "/admin/users", label: "Users", icon: "◍" },
  { to: "/admin/ngos", label: "NGOs", icon: "◎" },
  { to: "/admin/donations", label: "Donations", icon: "⚘" },
  { to: "/admin/reports", label: "Reports", icon: "▤" },
];

/**
 * Admin section's own sidebar navigation. Intentionally separate from the
 * main site Navbar — the admin shell (sidebar + AdminNavbar) is its own
 * layout and does not render the public Navbar/Footer.
 */
const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__brand-icon">🌿</span>
        <span className="admin-sidebar__brand-text">
          FoodSaver <b>AI</b>
        </span>
      </div>

      <nav className="admin-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`
            }
          >
            <span className="admin-sidebar__link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/" className="admin-sidebar__exit">
        ← Back to site
      </NavLink>
    </aside>
  );
};

export default AdminSidebar;
