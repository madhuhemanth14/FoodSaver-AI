import { Link, useNavigate } from "react-router-dom";
import { Leaf, Pencil, Trash2, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { roleHomePath, rolePrefix } from "../utils/roles";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const openSettings = (section) => {
    setProfileOpen(false);
    navigate(`${rolePrefix(user.role)}/settings${section ? `?section=${section}` : ""}`);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon">
          <Leaf size={24} />
        </div>
        <span>
          FoodSaver <b>AI</b>
        </span>
      </Link>

      <div className="nav-links">
        <a href="/#home">Home</a>
        <a href="/#about">About</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#features">Features</a>
        <a href="/#contact">Contact</a>
      </div>

      <div className="nav-buttons">
        {user ? (
          <>
            <Link to={roleHomePath(user.role)} className="dashboard-btn">
              Dashboard
            </Link>

            {/* The user's initial is the account menu trigger. */}
            <div
              className="nav-profile-wrap"
              ref={profileRef}
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                type="button"
                className="nav-avatar"
                title="Account settings"
                aria-label="Open account settings"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </button>

              {profileOpen && (
                <div className="nav-profile-menu" role="menu">
                  <div className="nav-profile-menu-title">
                    <strong>{user.name || "User"}</strong>
                    <span>{user.role === "ngo" ? "NGO Account" : "Donor Account"}</span>
                  </div>

                  <button type="button" role="menuitem" onClick={() => openSettings("edit")}>
                    <Pencil size={17} />
                    <span>Edit Profile</span>
                  </button>

                  <button type="button" role="menuitem" className="nav-profile-danger" onClick={() => openSettings("delete")}>
                    <Trash2 size={17} />
                    <span>Delete Profile</span>
                  </button>

                  <button type="button" role="menuitem" onClick={handleLogout}>
                    <LogOut size={17} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/signup" className="signup-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
