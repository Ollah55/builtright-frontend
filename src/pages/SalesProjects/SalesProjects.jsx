import { useCallback, useEffect, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiPlus, FiTrash2, FiUserPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SalesLayout from "../../components/SalesLayout/SalesLayout";
import { downloadAssessmentReport } from "../../lib/assessmentReportPdf";
import "./salesProjects.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const tokenHeaders = (json = false) => ({ ...(json ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${localStorage.getItem("salesToken")}` });
const blankAppliance = { name: "", quantity: "", watts: "", hoursPerDay: "", critical: false };
const initialForm = {
  customer: { fullName: "", email: "", phone: "", location: "" },
  paymentMethod: "bank-financing", financeInstitution: "RichGreen Microfinance Bank", systemDescription: "", installerId: "", notes: "", consentCaptured: false,
  loadAudit: { peakLoadKw: "", dailyEnergyKwh: "", criticalLoadKw: "", recommendedInverterKva: "", recommendedBatteryKwh: "", recommendedSolarKw: "", backupHours: "", notes: "", appliances: [{ ...blankAppliance }] },
};

function SalesProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const [projectsResponse, installersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/loan-requests`, { headers: tokenHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/installers`, { headers: tokenHeaders() }),
      ]);
      const projectData = await projectsResponse.json();
      const installerData = await installersResponse.json();
      if (!projectsResponse.ok || !projectData.status) throw new Error(projectData.message || "Could not load projects.");
      if (!installersResponse.ok || !installerData.status) throw new Error(installerData.message || "Could not load installers.");
      setProjects(projectData.loanRequests || []);
      setInstallers(installerData.installers || []);
    } catch (error) { setMessage(error.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => projects.filter((project) => [project.reference, project.customer?.fullName, project.customer?.phone, project.customer?.location].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))), [projects, search]);
  const setCustomer = (field, value) => setForm((current) => ({ ...current, customer: { ...current.customer, [field]: value } }));
  const setAudit = (field, value) => setForm((current) => ({ ...current, loadAudit: { ...current.loadAudit, [field]: value } }));
  const updateAppliance = (index, field, value) => setForm((current) => ({ ...current, loadAudit: { ...current.loadAudit, appliances: current.loadAudit.appliances.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects`, { method: "POST", headers: tokenHeaders(true), body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not register customer.");
      setForm(initialForm); setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const assignInstaller = async (projectId, installerId) => {
    if (!installerId) return;
    try {
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects/${projectId}/installer`, { method: "PATCH", headers: tokenHeaders(true), body: JSON.stringify({ installerId }) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not assign installer.");
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); }
  };

  return <SalesLayout title="Customer projects" subtitle="Register direct enquiries, capture WhatsApp load audits, assign site assessments, and prepare quotations.">
    {message && <p className="sales-message" role="status">{message}</p>}
    <section id="new-customer" className="sales-card sales-intake">
      <header><div><p>Direct and WhatsApp enquiries</p><h2>Register customer and assign installer</h2></div><FiUserPlus /></header>
      <form onSubmit={submit}>
        <fieldset><legend>Customer details</legend><div className="sales-form-grid"><label>Full name<input required value={form.customer.fullName} onChange={(event)=>setCustomer("fullName",event.target.value)}/></label><label>Email<input type="email" required value={form.customer.email} onChange={(event)=>setCustomer("email",event.target.value)}/></label><label>Phone / WhatsApp<input required value={form.customer.phone} onChange={(event)=>setCustomer("phone",event.target.value)}/></label><label>Project location<input required value={form.customer.location} onChange={(event)=>setCustomer("location",event.target.value)}/></label><label>Payment route<select value={form.paymentMethod} onChange={(event)=>setForm({...form,paymentMethod:event.target.value})}><option value="bank-financing">Bank financing</option><option value="outright">Outright payment</option></select></label><label>Finance institution<select disabled={form.paymentMethod==="outright"} value={form.financeInstitution} onChange={(event)=>setForm({...form,financeInstitution:event.target.value})}><option>RichGreen Microfinance Bank</option><option>LOTUS Bank</option></select></label><label className="wide">System discussed<input value={form.systemDescription} onChange={(event)=>setForm({...form,systemDescription:event.target.value})} placeholder="Initial system or customer request; final design follows assessment"/></label></div></fieldset>
        <fieldset><legend>WhatsApp load audit</legend><div className="sales-form-grid">{[["peakLoadKw","Peak load (kW)"],["dailyEnergyKwh","Daily energy (kWh/day)"],["criticalLoadKw","Critical load (kW)"],["recommendedInverterKva","Recommended inverter (kVA)"],["recommendedBatteryKwh","Battery storage (kWh)"],["recommendedSolarKw","Solar array (kW)"],["backupHours","Backup target (hours)"]].map(([field,label])=><label key={field}>{label}<input type="number" min="0" step="0.1" required={!['criticalLoadKw','backupHours'].includes(field)} value={form.loadAudit[field]} onChange={(event)=>setAudit(field,event.target.value)}/></label>)}<label className="wide">Audit notes<textarea rows="3" value={form.loadAudit.notes} onChange={(event)=>setAudit("notes",event.target.value)} placeholder="Customer priorities, operating schedule and information gathered on WhatsApp"/></label></div>
          <div className="sales-appliance-head"><strong>Appliance schedule</strong><button type="button" className="sales-button secondary" onClick={()=>setAudit("appliances",[...form.loadAudit.appliances,{...blankAppliance}])}><FiPlus /> Add appliance</button></div>
          <div className="sales-appliances">{form.loadAudit.appliances.map((item,index)=><div key={index}><input placeholder="Appliance" value={item.name} onChange={(event)=>updateAppliance(index,"name",event.target.value)}/><input type="number" placeholder="Qty" value={item.quantity} onChange={(event)=>updateAppliance(index,"quantity",event.target.value)}/><input type="number" placeholder="Watts" value={item.watts} onChange={(event)=>updateAppliance(index,"watts",event.target.value)}/><input type="number" placeholder="Hours/day" value={item.hoursPerDay} onChange={(event)=>updateAppliance(index,"hoursPerDay",event.target.value)}/><label className="critical"><input type="checkbox" checked={item.critical} onChange={(event)=>updateAppliance(index,"critical",event.target.checked)}/> Critical</label><button type="button" aria-label="Remove appliance" disabled={form.loadAudit.appliances.length===1} onClick={()=>setAudit("appliances",form.loadAudit.appliances.filter((_,itemIndex)=>itemIndex!==index))}><FiTrash2 /></button></div>)}</div>
        </fieldset>
        <fieldset><legend>Assign site assessment</legend><div className="sales-form-grid"><label>Installer<select required value={form.installerId} onChange={(event)=>setForm({...form,installerId:event.target.value})}><option value="">Select available installer</option>{installers.map((installer)=><option value={installer._id} key={installer._id}>{installer.fullName}</option>)}</select></label><label className="wide">Internal note<textarea rows="2" value={form.notes} onChange={(event)=>setForm({...form,notes:event.target.value})}/></label></div><label className="sales-consent"><input type="checkbox" required checked={form.consentCaptured} onChange={(event)=>setForm({...form,consentCaptured:event.target.checked})}/><span>The customer consented to BuiltRight recording this information and contacting them about the assessment and quotation.</span></label></fieldset>
        <button className="sales-button" type="submit" disabled={saving}>{saving?"Registering...":"Register customer and assign installer"}</button>
      </form>
    </section>

    <section className="sales-card sales-project-register"><header><div><p>Operations register</p><h2>Customer projects</h2></div><input type="search" placeholder="Search customer, phone, location or reference" value={search} onChange={(event)=>setSearch(event.target.value)}/></header><div className="sales-project-table"><div className="head"><span>Customer</span><span>Sales audit</span><span>Installer / site assessment</span><span>Status</span><span>Actions</span></div>{filtered.map((project)=><div className="row" key={project._id}><span><strong>{project.customer?.fullName}</strong><small>{project.reference} · {project.customer?.location}</small></span><span><strong>{project.assessment?.loadAudit?.recommendedInverterKva || 0} kVA / {project.assessment?.loadAudit?.recommendedBatteryKwh || 0} kWh</strong><small>{project.intake?.source === "sales-whatsapp" ? "Captured on WhatsApp" : "Website request"}</small></span><span><select aria-label={`Assign installer for ${project.customer?.fullName}`} value={project.installerAssignment?.installer || ""} disabled={project.installerAssignment?.status === "completed"} onChange={(event)=>assignInstaller(project._id,event.target.value)}><option value="">Assign installer</option>{installers.map((installer)=><option value={installer._id} key={installer._id}>{installer.fullName}</option>)}</select><small>{project.assessment?.inspection?.status || "pending"} · {project.assessment?.inspection?.result || "pending"}</small></span><span><i className={project.assessment?.status || "open"}>{project.assessment?.status || "open"}</i><small>{project.quotation?.status || "quotation not started"}</small></span><span className="actions"><button type="button" title="Download combined report" onClick={()=>downloadAssessmentReport(project)}><FiDownload /></button><button type="button" onClick={()=>navigate(`/sales/projects/${project._id}`)}><FiFileText /> Review & quote</button></span></div>)}{!filtered.length&&<p className="sales-empty">No customer projects found.</p>}</div></section>
  </SalesLayout>;
}

export default SalesProjects;
