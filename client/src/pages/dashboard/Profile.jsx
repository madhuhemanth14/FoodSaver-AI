import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Phone, MapPin, Lock, ArrowLeft, Save } from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();

  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile(form);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button className="profile-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="profile-header-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-header-info">
            <h1>{user?.name || "User"}</h1>
            <p className="profile-role">{user?.role === "ngo" ? "NGO Partner" : user?.role === "admin" ? "Administrator" : "Food Donor"}</p>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => { setTab("profile"); setMessage({ type: "", text: "" }); }}
          >
            <User size={16} /> Profile
          </button>
          <button
            className={tab === "password" ? "active" : ""}
            onClick={() => { setTab("password"); setMessage({ type: "", text: "" }); }}
          >
            <Lock size={16} /> Password
          </button>
        </div>

        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {tab === "profile" && (
          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="profile-field">
              <label><User size={14} /> Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="profile-field">
              <label><Mail size={14} /> Email</label>
              <input value={user?.email || ""} disabled className="disabled" />
              <small>Email cannot be changed</small>
            </div>
            <div className="profile-field">
              <label><Phone size={14} /> Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
            </div>
            <div className="profile-field">
              <label><MapPin size={14} /> Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Your address" rows={3} />
            </div>
            <button type="submit" className="profile-save-btn" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {tab === "password" && (
          <form className="profile-form" onSubmit={handlePasswordSave}>
            <div className="profile-field">
              <label><Lock size={14} /> Current Password</label>
              <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} placeholder="Enter current password" />
            </div>
            <div className="profile-field">
              <label><Lock size={14} /> New Password</label>
              <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} placeholder="Enter new password (min 6 chars)" />
            </div>
            <div className="profile-field">
              <label><Lock size={14} /> Confirm New Password</label>
              <input type="password" name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} placeholder="Confirm new password" />
            </div>
            <button type="submit" className="profile-save-btn" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
