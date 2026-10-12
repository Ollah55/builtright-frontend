import { useCallback, useEffect, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiUserPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SalesLayout from "../../components/SalesLayout/SalesLayout";
import { downloadAssessmentReport } from "../../lib/assessmentReportPdf";
import "./salesProjects.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const tokenHeaders = (json = false) => ({ ...(json ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${localStorage.getItem("salesToken")}` });
const initialForm = {
  customer: { fullName: "", email: "", phone: "", location: "" },
  paymentMethod: "bank-financing",
  financeInstitution: "RichGreen Microfinance Bank",
  systemDescription: "",
  inspectionFeeAmount: "",
  installerId: "",
  notes: "",
  consentCaptured: false,
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
  const formatMoney = (value) => Number(value || 0).toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects`, { method: "POST", headers: tokenHeaders(true), body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not book the assessment.");
      setForm(initialForm);
      setMessage(data.message);
      await load();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const assignInstaller = async (projectId, installerId) => {
    if (!installerId) return;
    try {
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects/${projectId}/installer`, { method: "PATCH", headers: tokenHeaders(true), body: JSON.stringify({ installerId }) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not assign installer.");
      setMessage(data.message);
      await load();
    } catch (error) { setMessage(error.message); }
  };

  const updateAssessmentFee = async (project) => {
    const value = window.prompt("Enter the assessment fee (NGN). The installer will not see this amount.", project.inspection?.feeAmount || "");
    if (value === null) return;
    try {
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects/${project._id}/assessment-fee`, { method: "PATCH", headers: tokenHeaders(true), body: JSON.stringify({ inspectionFeeAmount: value }) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not update assessment fee.");
      setMessage(data.message);
      await load();
    } catch (error) { setMessage(error.message); }
  };

  const confirmAssessmentPayment = async (project) => {
    if (!window.confirm(`Confirm that ${project.customer?.fullName}'s assessment payment has been received?`)) return;
    try {
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects/${project._id}/assessment-payment-confirmed`, { method: "PATCH", headers: tokenHeaders(true), body: "{}" });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not confirm assessment payment.");
      setMessage(data.message);
      await load();
    } catch (error) { setMessage(error.message); }
  };

  return <SalesLayout title="Customer projects" subtitle="Book customer assessments, set the fee, assign installers, and prepare quotations after the field report.">
    {message && <p className="sales-message" role="status">{message}</p>}
    <section id="new-customer" className="sales-card sales-intake">
      <header><div><p>Direct and WhatsApp enquiries</p><h2>Book assessment and assign installer</h2></div><FiUserPlus /></header>
      <form onSubmit={submit}>
        <fieldset>
          <legend>Customer details</legend>
          <div className="sales-form-grid">
            <label>Full name<input required value={form.customer.fullName} onChange={(event) => setCustomer("fullName", event.target.value)} /></label>
            <label>Email<input type="email" required value={form.customer.email} onChange={(event) => setCustomer("email", event.target.value)} /></label>
            <label>Phone / WhatsApp<input required value={form.customer.phone} onChange={(event) => setCustomer("phone", event.target.value)} /></label>
            <label>Project location<input required value={form.customer.location} onChange={(event) => setCustomer("location", event.target.value)} /></label>
            <label>Payment route<select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}><option value="bank-financing">Bank financing</option><option value="outright">Outright payment</option></select></label>
            <label>Finance institution<select disabled={form.paymentMethod === "outright"} value={form.financeInstitution} onChange={(event) => setForm({ ...form, financeInstitution: event.target.value })}><option>RichGreen Microfinance Bank</option><option>LOTUS Bank</option></select></label>
            <label className="wide">System discussed<input value={form.systemDescription} onChange={(event) => setForm({ ...form, systemDescription: event.target.value })} placeholder="Optional; final system design follows the site assessment" /></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Book site assessment</legend>
          <div className="sales-form-grid">
            <label>Assessment fee (NGN)<input required type="number" min="1" step="1" value={form.inspectionFeeAmount} onChange={(event) => setForm({ ...form, inspectionFeeAmount: event.target.value })} placeholder="Set by sales; hidden from installer" /></label>
            <label>Installer<select required value={form.installerId} onChange={(event) => setForm({ ...form, installerId: event.target.value })}><option value="">Select available installer</option>{installers.map((installer) => <option value={installer._id} key={installer._id}>{installer.fullName}</option>)}</select></label>
            <label className="wide">Internal note<textarea rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional sales note; do not enter the projected WhatsApp load audit" /></label>
          </div>
          <label className="sales-consent"><input type="checkbox" required checked={form.consentCaptured} onChange={(event) => setForm({ ...form, consentCaptured: event.target.checked })} /><span>The customer consented to BuiltRight recording these details and contacting them about the assessment and quotation.</span></label>
        </fieldset>
        <button className="sales-button" type="submit" disabled={saving}>{saving ? "Booking..." : "Book assessment and assign installer"}</button>
      </form>
    </section>

    <section className="sales-card sales-project-register">
      <header><div><p>Operations register</p><h2>Customer projects</h2></div><input type="search" placeholder="Search customer, phone, location or reference" value={search} onChange={(event) => setSearch(event.target.value)} /></header>
      <div className="sales-project-table">
        <div className="head"><span>Customer</span><span>Assessment fee</span><span>Installer / site assessment</span><span>Status</span><span>Actions</span></div>
        {filtered.map((project) => <div className="row" key={project._id}>
          <span><strong>{project.customer?.fullName}</strong><small>{project.reference} · {project.customer?.location}</small></span>
          <span><strong>{project.inspection?.feeAmount ? formatMoney(project.inspection.feeAmount) : "Not set"}</strong><small>{project.inspection?.feeStatus || "not requested"}</small><button type="button" className="sales-fee-edit" disabled={["payment-requested", "proof-submitted", "payment-confirmed"].includes(project.inspection?.feeStatus)} onClick={() => updateAssessmentFee(project)}>Edit fee</button>{project.inspection?.feeStatus === "proof-submitted" && <><a className="sales-proof-link" href={project.inspection?.paymentProof?.url} target="_blank" rel="noreferrer">View proof</a><button type="button" className="sales-fee-edit" onClick={() => confirmAssessmentPayment(project)}>Confirm payment</button></>}</span>
          <span><select aria-label={`Assign installer for ${project.customer?.fullName}`} value={project.installerAssignment?.installer || ""} disabled={project.installerAssignment?.status === "completed"} onChange={(event) => assignInstaller(project._id, event.target.value)}><option value="">Assign installer</option>{installers.map((installer) => <option value={installer._id} key={installer._id}>{installer.fullName}</option>)}</select><small>{project.assessment?.inspection?.status || "pending"} · {project.assessment?.inspection?.result || "pending"}</small></span>
          <span><i className={project.assessment?.status || "open"}>{project.assessment?.status || "open"}</i><small>{project.quotation?.status || "quotation not started"}</small></span>
          <span className="actions"><button type="button" title="Download combined report" onClick={() => downloadAssessmentReport(project)}><FiDownload /></button><button type="button" onClick={() => navigate(`/sales/projects/${project._id}`)}><FiFileText /> Review & quote</button></span>
        </div>)}
        {!filtered.length && <p className="sales-empty">No customer projects found.</p>}
      </div>
    </section>
  </SalesLayout>;
}

export default SalesProjects;
