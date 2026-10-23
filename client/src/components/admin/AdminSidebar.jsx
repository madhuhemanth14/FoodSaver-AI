import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Package,
  FileText,
  Leaf,
  ArrowLeft,
} from "lucide-react";
import "../../styles/admin-theme.css";
import "./AdminSidebar.css";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { to: "/admin/ngos", label: "NGOs", icon: <Building2 size={18} /> },
  { to: "/admin/donations", label: "Donations", icon: <Package size={18} /> },
  { to: "/admin/reports", label: "Reports", icon: <FileText size={18} /> },
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
        <span className="admin-sidebar__brand-icon" style={{ display: "inline-flex", alignItems: "center" }}>
          <Leaf size={20} color="var(--fs-primary, #2e7d32)" />
        </span>
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
            <span className="admin-sidebar__link-icon" style={{ display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/" className="admin-sidebar__exit" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <ArrowLeft size={16} /> Back to site
      </NavLink>
    </aside>
  );
};

export default AdminSidebar;
