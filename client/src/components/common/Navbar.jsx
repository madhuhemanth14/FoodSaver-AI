import { NavLink } from "react-router-dom";

function Navbar() {
  const getNavClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      {/* LOGO */}
      <NavLink to="/ngos" className="navbar-logo">
        <span className="logo-icon">🌱</span>
        <span>FoodSaver AI</span>
      </NavLink>

      {/* NAVIGATION */}
      <div className="navbar-links">
        <NavLink to="/ngos" className={getNavClass}>
          📋 NGOs
        </NavLink>

        <NavLink to="/map" className={getNavClass}>
          🗺️ Map
        </NavLink>

        <NavLink to="/pickup/request" className={getNavClass}>
          📦 Schedule Pickup
        </NavLink>

        <NavLink to="/pickup/tracking" className={getNavClass}>
          🚚 Track Pickup
        </NavLink>

        <NavLink to="/pickup/history" className={getNavClass}>
          📜 Pickup History
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;