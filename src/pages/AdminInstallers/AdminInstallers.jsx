import { useCallback, useEffect, useState } from "react";
import { FiMail, FiPlus, FiTool, FiUserCheck } from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminInstallers.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken")}` });

function AdminInstallers() {
  const [installers, setInstallers] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/installers`, { headers: headers() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load installers.");
      setInstallers(data.installers);
    } catch (error) { setMessage(error.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addInstaller = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/admin/installers`, { method: "POST", headers: headers(), body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not invite installer.");
      setForm({ fullName: "", email: "" }); setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  return <AdminLayout title="Installers" subtitle="Manage the field team, invite new installers, and view their assigned inspection workload.">
    {message && <p className="installer-admin-message">{message}</p>}
    <section className="installer-admin-grid">
      <article className="installer-admin-card invite"><div><p className="ops-section-kicker">Field team</p><h2>Add installer</h2><span>Each installer receives a secure email invitation to create their own password.</span></div><form onSubmit={addInstaller}><label>Full name<input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required /></label><label>Work email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label><button className="ops-button primary" type="submit" disabled={saving}><FiPlus /> {saving ? "Sending..." : "Send installer invitation"}</button></form></article>
      <article className="installer-admin-card overview"><p className="ops-section-kicker">Assignment rules</p><h2>Automatic balancing</h2><p>New financing requests go to the available active installer with the fewest open assignments. A declined assignment is automatically offered to another available installer.</p><div><FiTool /><span>Inspection, load audit, due diligence, and materials report are completed in the installer profile.</span></div></article>
    </section>
    <section className="installer-admin-list ops-card"><header><div><p className="ops-section-kicker">Installer directory</p><h2>{installers.length} installer{installers.length === 1 ? "" : "s"}</h2></div><span>Invitation-only access</span></header><div className="installer-admin-table"><div className="installer-admin-row head"><span>Installer</span><span>Status</span><span>Availability</span><span>Open assignments</span></div>{installers.map((installer) => <div className="installer-admin-row" key={installer._id}><div><strong>{installer.fullName}</strong><small><FiMail /> {installer.email}</small></div><span className={installer.isActive ? "active" : "invited"}>{installer.isActive ? "Active" : "Invitation pending"}</span><span>{installer.installerProfile?.availability || "available"}</span><strong>{installer.activeAssignments || 0}</strong></div>)}{!installers.length && <p className="installer-admin-empty">No installers yet.</p>}</div></section>
  </AdminLayout>;
}

export default AdminInstallers;
