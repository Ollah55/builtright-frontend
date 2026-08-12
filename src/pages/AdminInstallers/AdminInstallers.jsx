import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiMail, FiMapPin, FiPlus, FiTool, FiTrash2, FiUserCheck, FiX } from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminInstallers.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken")}` });

function AdminInstallers() {
  const [installers, setInstallers] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedInstaller, setSelectedInstaller] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingWorkboard, setLoadingWorkboard] = useState(false);
  const [deletingId, setDeletingId] = useState("");

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

  const openWorkboard = async (installer) => {
    try {
      setSelectedInstaller(installer);
      setAssignments([]);
      setLoadingWorkboard(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/installers/${installer._id}/assignments`, { headers: headers() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load installer work.");
      setSelectedInstaller(data.installer);
      setAssignments(data.assignments || []);
    } catch (error) {
      setMessage(error.message || "Could not load installer work.");
      setSelectedInstaller(null);
    } finally { setLoadingWorkboard(false); }
  };

  const deleteInstaller = async (installer) => {
    const confirmed = window.confirm(`Delete ${installer.fullName}'s installer account? This cannot be undone. Installers with active assignments cannot be deleted.`);
    if (!confirmed) return;
    try {
      setDeletingId(installer._id);
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/admin/installers/${installer._id}`, { method: "DELETE", headers: headers() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not delete installer.");
      setInstallers((items) => items.filter((item) => item._id !== installer._id));
      if (selectedInstaller?._id === installer._id) setSelectedInstaller(null);
      setMessage(data.message);
    } catch (error) { setMessage(error.message || "Could not delete installer."); } finally { setDeletingId(""); }
  };

  const formatDate = (value, includeTime = false) => value ? new Date(value).toLocaleString("en-GB", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }) : "Not scheduled";
  const assessmentProgress = (assignment) => {
    const assessment = assignment.assessment || {};
    const checks = [assessment.inspection?.result, assessment.loadAudit?.result, assessment.dueDiligence?.result];
    return `${checks.filter((item) => item === "pass").length}/3 checks passed`;
  };

  return <AdminLayout title="Installers" subtitle="Manage the field team, invite new installers, and view their assigned inspection workload.">
    {message && <p className="installer-admin-message">{message}</p>}
    <section className="installer-admin-grid">
      <article className="installer-admin-card invite"><div><p className="ops-section-kicker">Field team</p><h2>Add installer</h2><span>Each installer receives a secure email invitation to create their own password.</span></div><form onSubmit={addInstaller}><label>Full name<input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required /></label><label>Work email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label><button className="ops-button primary" type="submit" disabled={saving}><FiPlus /> {saving ? "Sending..." : "Send installer invitation"}</button></form></article>
      <article className="installer-admin-card overview"><p className="ops-section-kicker">Assignment rules</p><h2>Automatic balancing</h2><p>New financing requests go to the available active installer with the fewest open assignments. A declined assignment is automatically offered to another available installer.</p><div><FiTool /><span>Inspection, load audit, due diligence, and materials report are completed in the installer profile.</span></div></article>
    </section>
    <section className="installer-admin-list ops-card"><header><div><p className="ops-section-kicker">Installer directory</p><h2>{installers.length} installer{installers.length === 1 ? "" : "s"}</h2></div><span>Click an installer to view their workboard</span></header><div className="installer-admin-table"><div className="installer-admin-row head"><span>Installer</span><span>Status</span><span>Availability</span><span>Open assignments</span><span /></div>{installers.map((installer) => <div className="installer-admin-row installer-row-button" key={installer._id}><button type="button" className="installer-work-trigger" onClick={() => openWorkboard(installer)}><strong>{installer.fullName}</strong><small><FiMail /> {installer.email}</small></button><span className={installer.isActive ? "active" : "invited"}>{installer.isActive ? "Active" : "Invitation pending"}</span><span>{installer.installerProfile?.availability || "available"}</span><strong>{installer.activeAssignments || 0}</strong><span className="installer-row-actions"><button type="button" className="installer-view-work" onClick={() => openWorkboard(installer)}>View work</button><button type="button" className="installer-delete" disabled={deletingId === installer._id} onClick={() => deleteInstaller(installer)} aria-label={`Delete ${installer.fullName}`}><FiTrash2 /></button></span></div>)}{!installers.length && <p className="installer-admin-empty">No installers yet.</p>}</div></section>
    {selectedInstaller && <div className="installer-workboard-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedInstaller(null); }}><aside className="installer-workboard" role="dialog" aria-modal="true" aria-label={`${selectedInstaller.fullName} workboard`}><header><div><p>Installer workboard</p><h2>{selectedInstaller.fullName}</h2><span>{selectedInstaller.email} · {selectedInstaller.installerProfile?.availability || "available"}</span></div><button type="button" aria-label="Close workboard" onClick={() => setSelectedInstaller(null)}><FiX /></button></header><div className="installer-workboard-scroll">{loadingWorkboard ? <p className="installer-workboard-empty">Loading assignments...</p> : assignments.length === 0 ? <p className="installer-workboard-empty">No assignments have been allocated to this installer yet.</p> : assignments.map((assignment) => <article className="installer-assignment-card" key={assignment._id}><div className="installer-assignment-head"><div><span>{assignment.reference}</span><h3>{assignment.customer?.fullName}</h3><p><FiMapPin /> {assignment.customer?.location || "Location pending"}</p></div><i>{assignment.installerAssignment?.status || "assigned"}</i></div><div className="installer-customer-contact"><a href={`tel:${assignment.customer?.phone || ""}`}>{assignment.customer?.phone || "Phone pending"}</a><a href={`mailto:${assignment.customer?.email || ""}`}>{assignment.customer?.email || "Email pending"}</a></div><div className="installer-assignment-grid"><div><FiTool /><span>System</span><strong>{assignment.items?.[0]?.name || "Solar project"}</strong><small>{assignment.productSource || "BuiltRight Marketplace"} · {assignment.paymentMethod === "outright" ? "Outright" : "Financing"}</small></div><div><FiCalendar /><span>Inspection</span><strong>{formatDate(assignment.inspection?.scheduledAt, true)}</strong><small>{assignment.inspection?.feeStatus || "fee not requested"}</small></div><div><FiCheckCircle /><span>Assessment</span><strong>{assessmentProgress(assignment)}</strong><small>{assignment.assessment?.status || "open"}</small></div><div><FiClock /><span>Last activity</span><strong>{formatDate(assignment.updatedAt, true)}</strong><small>Case status: {assignment.status}</small></div></div>{assignment.installerAssignment?.history?.length > 0 && <div className="installer-history"><strong>Recent assignment activity</strong>{assignment.installerAssignment.history.slice().reverse().slice(0, 3).map((item, index) => <p key={`${item.changedAt}-${index}`}><b>{item.status}</b> · {item.note || "Status updated"}<small>{formatDate(item.changedAt, true)}</small></p>)}</div>}</article>)}</div></aside></div>}
  </AdminLayout>;
}

export default AdminInstallers;
