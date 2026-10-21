import { useCallback, useEffect, useState } from "react";
import { FiMail, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import useLiveRefresh from "../../hooks/useLiveRefresh";
import "./adminSalesTeam.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken")}` });

function AdminSalesTeam() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sales-team`, { headers: headers() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load sales team.");
      setMembers(data.members || []);
    } catch (error) { setMessage(error.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load);
  const invite = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/admin/sales-team`, { method: "POST", headers: headers(), body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not send invitation.");
      setForm({ fullName: "", email: "", phone: "" }); setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };
  const remove = async (member) => {
    if (!window.confirm(`Delete ${member.fullName}'s sales login? Existing customer projects will be preserved.`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/sales-team/${member._id}`, { method: "DELETE", headers: headers() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not delete account.");
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); }
  };
  return <AdminLayout title="Sales team" subtitle="Invite sales staff who can register direct customers, capture WhatsApp load audits, assign installers, review field reports, and prepare quotations.">
    {message&&<p className="sales-admin-message">{message}</p>}
    <section className="sales-admin-grid"><article className="ops-card sales-admin-invite"><div><p className="ops-section-kicker">Role management</p><h2>Invite sales team member</h2><span>They receive a secure link and create their own password.</span></div><form onSubmit={invite}><label>Full name<input required value={form.fullName} onChange={(event)=>setForm({...form,fullName:event.target.value})}/></label><label>Work email<input type="email" required value={form.email} onChange={(event)=>setForm({...form,email:event.target.value})}/></label><label>Phone number<input value={form.phone} onChange={(event)=>setForm({...form,phone:event.target.value})}/></label><button className="ops-button primary" disabled={saving}><FiPlus /> {saving?"Sending...":"Send sales invitation"}</button></form></article><article className="ops-card sales-admin-scope"><FiUsers/><h2>Sales permissions</h2><p>Sales staff can create customer projects, enter completed load audits, select an available installer, view merged assessments, download reports, and prepare quotations. They cannot delete customers, installers, orders, devices, or company data.</p></article></section>
    <section className="ops-card sales-admin-directory"><header><div><p className="ops-section-kicker">Directory</p><h2>{members.length} sales team member{members.length===1?"":"s"}</h2></div><span>Sales login: www.builtrightltd.com/sales/login</span></header><div className="sales-admin-table"><div className="head"><span>Team member</span><span>Account</span><span>Projects registered</span><span>Invited</span><span/></div>{members.map((member)=><div className="row" key={member._id}><span><strong>{member.fullName}</strong><small><FiMail/> {member.email}</small></span><i className={member.isActive?"active":"pending"}>{member.isActive?"Active":"Invitation pending"}</i><strong>{member.projectsCreated||0}</strong><span>{new Date(member.createdAt).toLocaleDateString("en-GB")}</span><button type="button" onClick={()=>remove(member)} aria-label={`Delete ${member.fullName}`}><FiTrash2/></button></div>)}{!members.length&&<p className="empty">No sales team accounts yet.</p>}</div></section>
  </AdminLayout>;
}

export default AdminSalesTeam;
