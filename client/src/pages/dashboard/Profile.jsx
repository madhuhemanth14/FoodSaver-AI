import { useState } from "react";
import "./Profile.css";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/authService";

const ROLE_LABELS = { donor: "Food Donor", ngo: "NGO", admin: "Admin" };

/**
 * Real, backend-validated profile editing (PATCH /api/auth/profile).
 * View mode -> Edit Profile -> form -> Save Changes -> backend validation
 * -> success message -> updated profile, or Cancel without losing the
 * previously saved data.
 */
const Profile = () => {
  const { user, loading, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) {
    return <div className="profile-page" />;
  }

  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "—";
  const displayRole = user ? ROLE_LABELS[user.role] || user.role : "—";
  const displayLocation = user?.address || "Not set";
  const displayPhone = user?.phone || "Not set";

  const startEditing = () => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { user: updated } = await updateProfile(form);
      updateUser(updated);
      setSuccess("Profile updated.");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <h1 className="profile-card__name">{displayName}</h1>
        <span className="profile-card__role">{displayRole}</span>

        {success && !editing && <p className="profile-card__success">{success}</p>}

        {!editing ? (
          <>
            <div className="profile-card__details">
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Email</span>
                <span className="profile-card__detail-value">{displayEmail}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Role</span>
                <span className="profile-card__detail-value">{displayRole}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Phone</span>
                <span className="profile-card__detail-value">{displayPhone}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Location</span>
                <span className="profile-card__detail-value">{displayLocation}</span>
              </div>
            </div>

            <button type="button" className="profile-card__edit-button" onClick={startEditing}>
              Edit Profile
            </button>
          </>
        ) : (
          <form className="profile-card__form" onSubmit={handleSave}>
            <label className="profile-card__field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="profile-card__field">
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label className="profile-card__field">
              <span>Address</span>
              <input name="address" value={form.address} onChange={handleChange} />
            </label>
            <label className="profile-card__field">
              <span>Email</span>
              <input value={displayEmail} disabled title="Email can't be changed here" />
            </label>

            {error && <p className="profile-card__error" role="alert">{error}</p>}

            <div className="profile-card__form-actions">
              <button type="button" className="profile-card__cancel-button" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="profile-card__edit-button" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
