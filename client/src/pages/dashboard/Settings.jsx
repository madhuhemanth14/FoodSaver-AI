import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, Trash2, UserRound, ShieldAlert, Check } from "lucide-react";
import BackButton from "../../components/common/BackButton";
import { useAuth } from "../../context/AuthContext";
import { deleteAccount, updateProfile } from "../../services/authService";
import { getMyNGO, updateMyNGO } from "../../services/ngoService";
import "./Settings.css";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNgo = user?.role === "ngo";
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(isNgo);
  const [section, setSection] = useState(searchParams.get("section") || "home");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    if (!isNgo) return;
    let cancelled = false;
    getMyNGO().then((data) => {
      if (cancelled) return;
      setNgo(data);
      setForm({
        name: data?.name || "",
        phone: data?.phone || "",
        address: data?.address || "",
        city: data?.city || "",
        state: data?.state || "",
        status: data?.status || "Open",
        capacity: data?.capacity || "Medium",
        acceptedFood: (data?.acceptedFood || []).join(", "),
      });
    }).catch((err) => {
      if (!cancelled) setError(err.response?.data?.message || "Couldn't load your NGO profile.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isNgo]);

  useEffect(() => {
    const requested = searchParams.get("section");
    if (requested === "edit" || requested === "delete") setSection(requested);
  }, [searchParams]);

  // The profile menu can open Settings directly with ?section=edit.
  // In that case startEdit() is not called, so keep the form synchronized
  // with the already-known account details instead of showing blank fields.
  useEffect(() => {
    if (section !== "edit") return;

    if (isNgo) {
      if (!ngo) return;
      setForm({
        name: ngo.name || user?.name || "",
        phone: ngo.phone || user?.phone || "",
        address: ngo.address || user?.address || "",
        city: ngo.city || "",
        state: ngo.state || "",
        status: ngo.status || "Open",
        capacity: ngo.capacity || "Medium",
        acceptedFood: (ngo.acceptedFood || []).join(", "),
      });
      return;
    }

    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [section, isNgo, ngo, user]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 2200);
    return () => clearTimeout(timer);
  }, [success]);

  const base = isNgo ? "/ngo" : "/donor";
  const goSection = (next) => {
    setError("");
    setSection(next);
    navigate(`${base}/settings${next === "home" ? "" : `?section=${next}`}`, { replace: true });
  };

  const startEdit = () => {
    setError("");
    if (isNgo && ngo) {
      setForm({
        name: ngo.name || "", phone: ngo.phone || "", address: ngo.address || "",
        city: ngo.city || "", state: ngo.state || "", status: ngo.status || "Open",
        capacity: ngo.capacity || "Medium", acceptedFood: (ngo.acceptedFood || []).join(", "),
      });
    } else {
      setForm({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "" });
    }
    goSection("edit");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (!form.name.trim()) throw new Error("Name cannot be empty.");
      if (isNgo) {
        const updated = await updateMyNGO({
          ...form,
          acceptedFood: form.acceptedFood.split(",").map((v) => v.trim()).filter(Boolean),
        });
        setNgo(updated);
        setSuccess("Organization profile updated.");
      } else {
        const result = await updateProfile({ name: form.name, phone: form.phone, address: form.address });
        updateUser(result.user);
        setSuccess("Profile updated successfully.");
      }
      setSection("home");
      navigate(`${base}/settings`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(isNgo ? "Delete your NGO account permanently? This cannot be undone." : "Delete your FoodSaver AI account permanently? This cannot be undone.")) return;
    setSaving(true); setError("");
    try {
      await deleteAccount();
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete your account. Please try again.");
      setSaving(false);
    }
  };

  if (loading) return <div className="settings-page"><div className="settings-card"><p>Loading settings…</p></div></div>;

  return (
    <div className="settings-page">
      <div className="settings-shell">
        <BackButton
          fallback={`${base}/dashboard`}
          onBack={section !== "home" ? () => goSection("home") : undefined}
          label={section !== "home" ? "Back to Settings" : "Back"}
        />

        <div className="settings-heading"><h1>Settings</h1><p>Manage your FoodSaver AI account.</p></div>
        {success && (
          <div className="settings-success" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Check size={16} /> {success}
          </div>
        )}
        {error && <div className="settings-error" role="alert">{error}</div>}

        {section === "home" && (
          <div className="settings-options">
            <button className="settings-option" type="button" onClick={startEdit}>
              <span className="settings-option-icon"><Pencil size={21} /></span>
              <span><strong>Edit Profile</strong><small>Update your personal information{isNgo ? " and NGO organization details" : ""}.</small></span>
              <span className="settings-arrow">›</span>
            </button>
            <button className="settings-option settings-danger" type="button" onClick={() => goSection("delete")}>
              <span className="settings-option-icon"><Trash2 size={21} /></span>
              <span><strong>Delete Account</strong><small>Permanently remove your FoodSaver AI account.</small></span>
              <span className="settings-arrow">›</span>
            </button>
          </div>
        )}

        {section === "edit" && (
          <form className="settings-form" onSubmit={handleSave}>
            <div className="settings-section-title"><UserRound size={20} /><span>{isNgo ? "Edit NGO Profile" : "Edit Profile"}</span></div>
            <label>Name / Organization Name<input name="name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Phone<input name="phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Address<input name="address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            {isNgo && <>
              <label>City<input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
              <label>State<input value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label>
              <label>Operating Status<select value={form.status || "Open"} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Open</option><option>Closed</option></select></label>
              <label>Capacity<select value={form.capacity || "Medium"} onChange={(e) => setForm({ ...form, capacity: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
              <label>Accepted Food Types<input value={form.acceptedFood || ""} onChange={(e) => setForm({ ...form, acceptedFood: e.target.value })} placeholder="Rice, vegetables, cooked food" /></label>
            </>}
            <label>Email<input value={user?.email || ngo?.email || ""} disabled /></label>
            <div className="settings-actions"><button type="button" className="settings-secondary" onClick={() => goSection("home")} disabled={saving}>Cancel</button><button type="submit" className="settings-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button></div>
          </form>
        )}

        {section === "delete" && (
          <div className="settings-delete-card">
            <div className="delete-icon"><ShieldAlert size={30} /></div>
            <h2>Delete {isNgo ? "NGO " : ""}Account</h2>
            <p>This permanently deletes your account. You will be signed out and will need to register again to use FoodSaver AI.</p>
            <div className="settings-actions"><button type="button" className="settings-secondary" onClick={() => goSection("home")} disabled={saving}>Cancel</button><button type="button" className="settings-delete-confirm" onClick={handleDelete} disabled={saving}>{saving ? "Deleting…" : "Delete Account"}</button></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Settings;
