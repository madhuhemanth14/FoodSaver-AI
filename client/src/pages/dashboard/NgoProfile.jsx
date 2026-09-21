import { useEffect, useState } from "react";
import "./Profile.css";
import { getMyNGO, updateMyNGO } from "../../services/ngoService";

/**
 * Real NGO organization profile — GET/PATCH /api/ngos/me. Separate from
 * the donor-style Profile.jsx because an NGO's identity is its
 * organization record (NGO doc), not just the User account fields.
 */
const NgoProfile = () => {
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMyNGO()
      .then(setNgo)
      .catch((err) => setError(err.response?.data?.message || "Couldn't load your NGO profile."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="profile-page" />;

  const startEditing = () => {
    setForm({
      name: ngo.name || "",
      address: ngo.address || "",
      city: ngo.city || "",
      state: ngo.state || "",
      phone: ngo.phone || "",
      email: ngo.email || "",
      status: ngo.status || "Open",
      capacity: ngo.capacity || "Medium",
      acceptedFood: (ngo.acceptedFood || []).join(", "),
    });
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateMyNGO({
        ...form,
        acceptedFood: form.acceptedFood.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setNgo(updated);
      setSuccess("Organization profile updated.");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update your organization profile.");
    } finally {
      setSaving(false);
    }
  };

  if (error && !ngo) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-card__error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__avatar">{(ngo?.name || "N").charAt(0).toUpperCase()}</div>
        <h1 className="profile-card__name">{ngo?.name}</h1>
        <span className="profile-card__role">
          {ngo?.verified ? "Verified NGO" : "Verification pending"} · {ngo?.status}
        </span>

        {success && !editing && <p className="profile-card__success">{success}</p>}

        {!editing ? (
          <>
            <div className="profile-card__details">
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Address</span>
                <span className="profile-card__detail-value">{ngo?.address}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">City / State</span>
                <span className="profile-card__detail-value">{ngo?.city}, {ngo?.state}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Phone</span>
                <span className="profile-card__detail-value">{ngo?.phone}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Capacity</span>
                <span className="profile-card__detail-value">{ngo?.capacity}</span>
              </div>
              <div className="profile-card__detail-row">
                <span className="profile-card__detail-label">Accepted Food</span>
                <span className="profile-card__detail-value">
                  {(ngo?.acceptedFood || []).join(", ") || "Not set"}
                </span>
              </div>
            </div>
            <button type="button" className="profile-card__edit-button" onClick={startEditing}>
              Edit Organization Profile
            </button>
          </>
        ) : (
          <form className="profile-card__form" onSubmit={handleSave}>
            <label className="profile-card__field"><span>Organization Name</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="profile-card__field"><span>Address</span>
              <input name="address" value={form.address} onChange={handleChange} required />
            </label>
            <label className="profile-card__field"><span>City</span>
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label className="profile-card__field"><span>State</span>
              <input name="state" value={form.state} onChange={handleChange} required />
            </label>
            <label className="profile-card__field"><span>Phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label className="profile-card__field"><span>Operating Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label className="profile-card__field"><span>Capacity</span>
              <select name="capacity" value={form.capacity} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label className="profile-card__field"><span>Accepted Food Types (comma-separated)</span>
              <input name="acceptedFood" value={form.acceptedFood} onChange={handleChange} />
            </label>

            {error && <p className="profile-card__error" role="alert">{error}</p>}

            <div className="profile-card__form-actions">
              <button type="button" className="profile-card__cancel-button" onClick={() => setEditing(false)} disabled={saving}>
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

export default NgoProfile;
