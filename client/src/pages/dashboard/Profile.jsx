import "./Profile.css";

const mockUser = {
  name: "Yamini Sharma",
  email: "yamini.sharma@example.com",
  role: "Donor",
  location: "Bengaluru, India",
};

/**
 * Member 5 — Profile page (UI only, no backend integration).
 */
const Profile = () => {
  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__avatar">
          {mockUser.name.charAt(0).toUpperCase()}
        </div>

        <h1 className="profile-card__name">{mockUser.name}</h1>
        <span className="profile-card__role">{mockUser.role}</span>

        <div className="profile-card__details">
          <div className="profile-card__detail-row">
            <span className="profile-card__detail-label">Email</span>
            <span className="profile-card__detail-value">
              {mockUser.email}
            </span>
          </div>
          <div className="profile-card__detail-row">
            <span className="profile-card__detail-label">Role</span>
            <span className="profile-card__detail-value">
              {mockUser.role}
            </span>
          </div>
          <div className="profile-card__detail-row">
            <span className="profile-card__detail-label">Location</span>
            <span className="profile-card__detail-value">
              {mockUser.location}
            </span>
          </div>
        </div>

        <button type="button" className="profile-card__edit-button">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
