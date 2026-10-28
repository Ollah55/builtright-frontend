import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiChevronRight, FiDownload, FiFileText, FiPackage, FiUserPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SalesLayout from "../../components/SalesLayout/SalesLayout";
import useLiveRefresh from "../../hooks/useLiveRefresh";
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
  inspectionCompleted: false,
  assessmentFeePaid: false,
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
        fetch(`${API_BASE_URL}/api/sales/projects`, { headers: tokenHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/installers`, { headers: tokenHeaders() }),
      ]);
      let projectData = await projectsResponse.json();
      const installerData = await installersResponse.json();
      if (!projectsResponse.ok || !projectData.status) {
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/loan-requests`, { headers: tokenHeaders() });
        const fallbackData = await fallbackResponse.json();
        if (!fallbackResponse.ok || !fallbackData.status) throw new Error(projectData.message || fallbackData.message || "Could not load registered customers.");
        projectData = fallbackData;
      }
      if (!installersResponse.ok || !installerData.status) throw new Error(installerData.message || "Could not load installers.");
      setProjects(projectData.customers || projectData.loanRequests || []);
      setInstallers(installerData.installers || []);
    } catch (error) { setMessage(error.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load);
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

  const downloadRichGreenApplication = async (project) => {
    try {
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/projects/${project._id}/richgreen-application/download`, { headers: tokenHeaders() });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not download the RichGreen application.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `RichGreen-Application-${project.reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) { setMessage(error.message); }
  };

  return <SalesLayout title="Customers & orders" subtitle="Register customers, follow inspection progress, open project records, and view quotations and invoices.">
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
          <label className="sales-offline-complete">
            <input type="checkbox" checked={form.inspectionCompleted} onChange={(event) => setForm({ ...form, inspectionCompleted: event.target.checked, assessmentFeePaid: event.target.checked ? true : false, installerId: event.target.checked ? "" : form.installerId })} />
            <span><strong>Inspection already completed</strong><small>Use this when the customer completed the inspection, load audit, and assessment payment through WhatsApp or another offline process. No installer will be assigned.</small></span>
          </label>
          {!form.inspectionCompleted && <label className="sales-offline-complete sales-payment-complete">
            <input required type="checkbox" checked={form.assessmentFeePaid} onChange={(event) => setForm({ ...form, assessmentFeePaid: event.target.checked, installerId: event.target.checked ? form.installerId : "" })} />
            <span><strong>I confirm the assessment fee has been received</strong><small>This confirmation must be completed first. Only after payment is confirmed can sales select an installer and create the inspection assignment.</small></span>
          </label>}
          <div className="sales-form-grid">
            <label>{form.inspectionCompleted ? "Assessment fee paid (NGN, optional)" : "Assessment fee received (NGN)"}<input required={!form.inspectionCompleted} type="number" min="1" step="1" value={form.inspectionFeeAmount} onChange={(event) => setForm({ ...form, inspectionFeeAmount: event.target.value })} placeholder={form.inspectionCompleted ? "Enter the amount if available" : "Enter the confirmed amount received"} /></label>
            <label>Installer<select required={!form.inspectionCompleted} disabled={form.inspectionCompleted || !form.assessmentFeePaid} value={form.installerId} onChange={(event) => setForm({ ...form, installerId: event.target.value })}><option value="">{form.inspectionCompleted ? "Not required for completed inspection" : !form.assessmentFeePaid ? "Confirm payment first" : "Select available installer"}</option>{installers.map((installer) => <option value={installer._id} key={installer._id}>{installer.fullName}</option>)}</select></label>
            <label className="wide">Internal note<textarea rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional sales note; do not enter the projected WhatsApp load audit" /></label>
          </div>
          <label className="sales-consent"><input type="checkbox" required checked={form.consentCaptured} onChange={(event) => setForm({ ...form, consentCaptured: event.target.checked })} /><span>The customer consented to BuiltRight recording these details and contacting them about the assessment and quotation.</span></label>
        </fieldset>
        <button className="sales-button" type="submit" disabled={saving || (!form.inspectionCompleted && !form.assessmentFeePaid)}>{saving ? "Saving..." : form.inspectionCompleted ? "Register completed assessment & create order" : form.assessmentFeePaid ? "Confirm payment, assign installer & create order" : "Confirm payment to continue"}</button>
      </form>
    </section>

    <section className="sales-card sales-project-register">
      <header><div><p>Sales customer register</p><h2>Registered customers</h2></div><input type="search" placeholder="Search customer, phone, location or reference" value={search} onChange={(event) => setSearch(event.target.value)} /></header>
      <div className="sales-project-table">
        <div className="head"><span>Customer</span><span>Order</span><span>Inspection progress</span><span>Invoice</span><span>Open record</span></div>
        {filtered.map((project) => <div className="row clickable" role="link" tabIndex="0" key={project._id} onClick={() => navigate(`/sales/projects/${project._id}`)} onKeyDown={(event) => { if (event.key === "Enter") navigate(`/sales/projects/${project._id}`); }}>
          <span><strong>{project.customer?.fullName}</strong><small>{project.reference} · {project.customer?.phone}</small><small>{project.customer?.location}</small></span>
          <span><strong><FiPackage /> {project.order?.orderNumber || "Creating order"}</strong><small>{project.order?.status || "Processing"}</small><small>{project.paymentMethod === "outright" ? "Outright" : project.financeInstitution}</small></span>
          <span onClick={(event) => event.stopPropagation()}><strong><FiCheckCircle /> {project.assessment?.inspection?.status || "pending"}</strong><small>Result: {project.assessment?.inspection?.result || "pending"}</small><small>{project.inspection?.feeAmount ? `${formatMoney(project.inspection.feeAmount)} · ` : ""}{project.inspection?.feeStatus || "not requested"}</small>{project.installerAssignment?.status !== "completed" && project.inspection?.status !== "completed" && <select aria-label={`Assign installer for ${project.customer?.fullName}`} value={project.installerAssignment?.installer || ""} onChange={(event) => assignInstaller(project._id, event.target.value)}><option value="">Assign installer</option>{installers.map((installer) => <option value={installer._id} key={installer._id}>{installer.fullName}</option>)}</select>}<button type="button" className="sales-fee-edit" disabled={["payment-requested", "proof-submitted", "payment-confirmed"].includes(project.inspection?.feeStatus)} onClick={() => updateAssessmentFee(project)}>Edit fee</button>{project.inspection?.feeStatus === "proof-submitted" && <><a className="sales-proof-link" href={project.inspection?.paymentProof?.url} target="_blank" rel="noreferrer">View proof</a><button type="button" className="sales-fee-edit" onClick={() => confirmAssessmentPayment(project)}>Confirm payment</button></>}</span>
          <span><strong>{project.invoice?.reference || project.inspectionInvoice?.reference || "Not generated"}</strong><small>{project.invoice?.status || (project.inspectionInvoice ? "Inspection invoice issued" : "Available after final project approval")}</small><small>{project.bankApplication?.richGreenApplication?.status === "submitted" ? "RichGreen application ready" : (project.quotation?.status || "Quotation not started")}</small></span>
          <span className="actions" onClick={(event) => event.stopPropagation()}><button type="button" title="Download combined assessment report" onClick={() => downloadAssessmentReport(project)}><FiDownload /></button>{project.bankApplication?.richGreenApplication?.status === "submitted" && <button type="button" title="Download submitted RichGreen application" onClick={() => downloadRichGreenApplication(project)}><FiDownload /> RichGreen form</button>}<button type="button" onClick={() => navigate(`/sales/projects/${project._id}`)}><FiFileText /> Details <FiChevronRight /></button></span>
        </div>)}
        {!filtered.length && <p className="sales-empty">No registered customers found.</p>}
      </div>
    </section>
  </SalesLayout>;
}

export default SalesProjects;
