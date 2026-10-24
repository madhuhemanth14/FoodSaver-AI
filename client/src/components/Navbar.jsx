import { Link, useNavigate, useLocation } from "react-router-dom";
import { Leaf, Pencil, Trash2, LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { roleHomePath, rolePrefix } from "../utils/roles";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileNavOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const openSettings = (section) => {
    setProfileOpen(false);
    setMobileNavOpen(false);
    navigate(`${rolePrefix(user.role)}/settings${section ? `?section=${section}` : ""}`);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={() => setMobileNavOpen(false)}>
        <div className="logo-icon">
          <Leaf size={22} />
        </div>
        <span>
          FoodSaver <b>AI</b>
        </span>
      </Link>

      {/* Navigation links (collapsible on mobile, inline on desktop) */}
      <div className={`nav-links ${mobileNavOpen ? "nav-links--open" : ""}`}>
        <a href="/#home" onClick={() => setMobileNavOpen(false)}>Home</a>
        <a href="/#about" onClick={() => setMobileNavOpen(false)}>About</a>
        <a href="/#how-it-works" onClick={() => setMobileNavOpen(false)}>How It Works</a>
        <a href="/#features" onClick={() => setMobileNavOpen(false)}>Features</a>
        <a href="/#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>

        {/* Mobile drawer auth fallback */}
        <div className="mobile-drawer-auth">
          {!user ? (
            <>
              <Link to="/login" className="mobile-drawer-btn mobile-drawer-btn--login" onClick={() => setMobileNavOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="mobile-drawer-btn mobile-drawer-btn--signup" onClick={() => setMobileNavOpen(false)}>
                Sign Up
              </Link>
            </>
          ) : (
            <Link to={roleHomePath(user.role)} className="mobile-drawer-btn mobile-drawer-btn--dashboard" onClick={() => setMobileNavOpen(false)}>
              Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="nav-buttons">
        {user ? (
          <>
            <Link to={roleHomePath(user.role)} className="dashboard-btn">
              Dashboard
            </Link>

            {/* The user's initial is the account menu trigger */}
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

        {/* Mobile menu toggle hamburger */}
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

