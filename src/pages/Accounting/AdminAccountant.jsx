import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { accountingApi } from "../../services/accountingApi";
import "./accounting.css";

export default function AdminAccountant() {
  const [accounts, setAccounts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { const data = await accountingApi("/admin/accountant", { admin: true }); setAccounts(data.accountants || []); setStartDate(data.startDate || ""); } catch (err) { setMessage(err.message); } }, []);
  useEffect(() => { load(); }, [load]);
  const invite = async (event) => { event.preventDefault(); setBusy(true); setMessage(""); try { const data = await accountingApi("/admin/accountant/invite", { admin: true, method: "POST", body: form }); setMessage(data.message); setForm({ fullName: "", email: "" }); await load(); } catch (err) { setMessage(err.message); } finally { setBusy(false); } };
  const revoke = async (person) => { if (!window.confirm(`Revoke ${person.fullName}'s accountant access? Existing accounting records will stay intact.`)) return; setBusy(true); setMessage(""); try { const data = await accountingApi(`/admin/accountant/${person.id}/revoke`, { admin: true, method: "PATCH" }); setMessage(data.message); await load(); } catch (err) { setMessage(err.message); } finally { setBusy(false); } };
  const active = accounts.find((person) => person.isActive);
  const pending = accounts.find((person) => !person.isActive && !person.activatedAt && person.invitationExpiresAt && new Date(person.invitationExpiresAt) > new Date());
  return <AdminLayout title="Accountant access" subtitle="One designated accountant manages the books; admin controls invitations only."><div className="acct-admin-grid"><section className="acct-panel"><h2>Accountant login</h2><p>Accounting entries and reports are restricted to the accountant portal. An admin login does not grant access to the books.</p><p><Link to="/accounting/login">Open accountant login →</Link></p><p className="acct-note">Accounting start date: {startDate ? new Date(`${startDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "loading"}. No opening balances have been created.</p></section><section className="acct-panel"><h2>{active ? "Current accountant" : "Invite an accountant"}</h2>{active ? <><p><strong>{active.fullName}</strong><br />{active.email}</p><button type="button" className="acct-danger" disabled={busy} onClick={() => revoke(active)}>Revoke access</button></> : <><form onSubmit={invite}><label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><button disabled={busy}>{busy ? "Sending…" : pending && pending.email === form.email.toLowerCase() ? "Resend invitation" : "Send invitation"}</button></form>{pending && <p>Pending invitation: {pending.fullName} ({pending.email}). Enter the same email to resend, or revoke the pending invitation before selecting another accountant. <button type="button" className="acct-text-button" onClick={() => revoke(pending)}>Revoke pending invitation</button></p>}</>}{message && <p role="status">{message}</p>}</section></div></AdminLayout>;
}
