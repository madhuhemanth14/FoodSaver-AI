import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleHomePath, rolePrefix } from "../utils/roles";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
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
            <Link to={`${rolePrefix(user.role)}/profile`} className="nav-avatar" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </Link>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
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
