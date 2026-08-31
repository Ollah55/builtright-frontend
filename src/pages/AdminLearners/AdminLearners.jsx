import { useCallback, useEffect, useState } from "react";
import { FiBookOpen, FiMail, FiPhone, FiPlus, FiTrash2 } from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { readLearnerApiResponse } from "../../services/learnerApi";
import "./adminLearners.css";
import "./trainingSettings.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken")}` });

function AdminLearners() {
  const [learners, setLearners] = useState([]);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [settings, setSettings] = useState({ cohortName: "BuiltRight Solar Installation Training", liveClassUrl: "", brochureUrl: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/learners`, { headers: headers() });
      const data = await readLearnerApiResponse(response, "Could not load learners.");
      setLearners(data.learners || []);
    } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/training-settings`, { headers: headers() })
      .then((response) => readLearnerApiResponse(response, "Could not load training settings."))
      .then((data) => { if (data.settings) setSettings((current) => ({ ...current, ...data.settings })); })
      .catch(() => undefined);
  }, []);

  const addLearner = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/admin/learners`, { method: "POST", headers: headers(), body: JSON.stringify(form) });
      const data = await readLearnerApiResponse(response, "Could not add learner.");
      setForm({ fullName: "", phone: "", email: "" }); setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const deleteLearner = async (learner) => {
    if (!window.confirm(`Delete ${learner.fullName}'s learner account? This cannot be undone.`)) return;
    try {
      setDeletingId(learner._id); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/admin/learners/${learner._id}`, { method: "DELETE", headers: headers() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not delete learner.");
      setLearners((items) => items.filter((item) => item._id !== learner._id)); setMessage(data.message);
    } catch (error) { setMessage(error.message); } finally { setDeletingId(""); }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    try {
      setSavingSettings(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/admin/training-settings`, { method: "PATCH", headers: headers(), body: JSON.stringify(settings) });
      const data = await readLearnerApiResponse(response, "Could not save training settings.");
      setMessage(data.message);
    } catch (error) { setMessage(error.message); } finally { setSavingSettings(false); }
  };

  return <AdminLayout title="Training learners" subtitle="Enroll virtual-class students, send secure invitations, and monitor cohort access."><div className="learner-admin-intro"><div><p className="ops-section-kicker">Virtual classroom</p><h2>Add a learner</h2><p>Enter a paid learner's details and BuiltRight will send a welcome email with a secure link to set their password.</p></div><FiBookOpen /></div>{message && <p className="learner-admin-message">{message}</p>}<section className="learner-admin-grid"><article className="learner-admin-card"><form onSubmit={addLearner}><label>Full name<input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required /></label><label>Phone number<input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required /></label><label>Email address<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label><button className="ops-button primary" type="submit" disabled={saving}><FiPlus /> {saving ? "Sending invite..." : "Add learner & send invite"}</button></form></article><article className="learner-admin-card learner-admin-info"><h3>What learners receive</h3><ul><li>Secure password-setup link by email</li><li>Private access to the active one-month cohort</li><li>Curriculum and brochure downloads</li><li>Live class join button for configured sessions</li></ul><small>Class schedule: Monday–Friday, 10:00–16:00 WAT.</small></article></section><section className="learner-admin-settings learner-admin-card"><div><p className="ops-section-kicker">Active cohort resources</p><h2>Configure learner links</h2><p>Paste the approved live-class room and brochure URL. Learners will see them immediately in their private portal.</p></div><form onSubmit={saveSettings}><label>Cohort name<input value={settings.cohortName} onChange={(event) => setSettings((current) => ({ ...current, cohortName: event.target.value }))} required /></label><label>Live class link<input type="url" placeholder="https://zoom.us/j/..." value={settings.liveClassUrl} onChange={(event) => setSettings((current) => ({ ...current, liveClassUrl: event.target.value }))} /></label><label>Brochure or curriculum PDF link<input type="url" placeholder="https://..." value={settings.brochureUrl} onChange={(event) => setSettings((current) => ({ ...current, brochureUrl: event.target.value }))} /></label><button className="ops-button primary" type="submit" disabled={savingSettings}>{savingSettings ? "Saving..." : "Save training links"}</button></form></section><section className="learner-admin-list ops-card"><header><div><p className="ops-section-kicker">Learner directory</p><h2>{learners.length} learner{learners.length === 1 ? "" : "s"}</h2></div><span>Only invited learners can access the training portal.</span></header>{loading ? <p className="learner-admin-empty">Loading learners...</p> : learners.length === 0 ? <p className="learner-admin-empty">No learners yet. Add the first paid student above.</p> : <div className="learner-admin-table"><div className="learner-admin-row head"><span>Learner</span><span>Contact</span><span>Cohort</span><span>Status</span><span /></div>{learners.map((learner) => <div className="learner-admin-row" key={learner._id}><div><strong>{learner.fullName}</strong><small><FiMail /> {learner.email}</small></div><div><span><FiPhone /> {learner.phone || "No phone"}</span></div><div><strong>{learner.learnerProfile?.cohortName || "BuiltRight Solar Installation Training"}</strong><small>Monday–Friday · 10:00–16:00 WAT</small></div><span className={learner.isActive ? "active" : "invited"}>{learner.isActive ? "Active" : "Invitation pending"}</span><button type="button" className="learner-delete" disabled={deletingId === learner._id} onClick={() => deleteLearner(learner)} aria-label={`Delete ${learner.fullName}`}><FiTrash2 /></button></div>)}</div>}</section></AdminLayout>;
}

export default AdminLearners;
