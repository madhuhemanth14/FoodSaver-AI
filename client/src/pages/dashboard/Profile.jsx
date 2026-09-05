import "./Profile.css";
import { useAuth } from "../../context/AuthContext";

const ROLE_LABELS = { donor: "Food Donor", ngo: "NGO", admin: "Admin" };

/**
 * Reads the real authenticated user from AuthContext (backed by
 * GET /api/auth/me) instead of a module-scoped localStorage read, which
 * ran once at import time and could never reflect a session that was
 * still loading -- that was the root cause of this page showing "Guest"
 * for a logged-in user.
 *
 * Edit Profile is not yet wired to a backend update endpoint -- that is
 * a separate piece of work (PUT /api/auth/me + form), so the button is
 * left as a visible placeholder rather than faked as functional.
 */
const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="profile-page" />;
  }

  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "—";
  const displayRole = user ? ROLE_LABELS[user.role] || user.role : "—";
  const displayLocation = user?.address || "Not set";

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <h1 className="profile-card__name">{displayName}</h1>
        <span className="profile-card__role">{displayRole}</span>

        <div className="profile-card__details">
          <div className="profile-card__detail-row">
            <span className="profile-card__detail-label">Email</span>
            <span className="profile-card__detail-value">
              {displayEmail}
            </span>
          </div>
          <div className="profile-card__detail-row">
            <span className="profile-card__detail-label">Role</span>
            <span className="profile-card__detail-value">
              {displayRole}
            </span>
          </div>
          <div className="profile-card__detail-row">
            <span className="profile-card__detail-label">Location</span>
            <span className="profile-card__detail-value">
              {displayLocation}
            </span>
          </div>
        </div>

        <button type="button" className="profile-card__edit-button" disabled title="Coming soon">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
