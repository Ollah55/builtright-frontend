import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiCalendar, FiCheck, FiLogOut, FiMapPin, FiPhone, FiPlus, FiSave, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./installerAssignments.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("installerToken")}` });

const checklistDefaults = [
  { key: "identity-contact", label: "Customer identity and contact verified", status: "pending" },
  { key: "property-authority", label: "Property ownership or installation authority verified", status: "pending" },
  { key: "site-access", label: "Site access and installation permissions confirmed", status: "pending" },
  { key: "technical-suitability", label: "Roof, electrical, and structural suitability confirmed", status: "pending" },
  { key: "financing-consent", label: "Financing data-sharing consent recorded", status: "pending" },
];

const makeReport = (assignment) => ({
  inspection: { status: assignment.assessment?.inspection?.status || "scheduled", result: assignment.assessment?.inspection?.result || "pending", notes: assignment.assessment?.inspection?.notes || "" },
  loadAudit: { status: assignment.assessment?.loadAudit?.status || "pending", result: assignment.assessment?.loadAudit?.result || "pending", peakLoadKw: assignment.assessment?.loadAudit?.peakLoadKw ?? "", dailyEnergyKwh: assignment.assessment?.loadAudit?.dailyEnergyKwh ?? "", criticalLoadKw: assignment.assessment?.loadAudit?.criticalLoadKw ?? "", recommendedInverterKva: assignment.assessment?.loadAudit?.recommendedInverterKva ?? "", recommendedBatteryKwh: assignment.assessment?.loadAudit?.recommendedBatteryKwh ?? "", recommendedSolarKw: assignment.assessment?.loadAudit?.recommendedSolarKw ?? "", backupHours: assignment.assessment?.loadAudit?.backupHours ?? "", notes: assignment.assessment?.loadAudit?.notes || "" },
  dueDiligence: { status: assignment.assessment?.dueDiligence?.status || "pending", result: assignment.assessment?.dueDiligence?.result || "pending", checklist: assignment.assessment?.dueDiligence?.checklist?.length ? assignment.assessment.dueDiligence.checklist : checklistDefaults, notes: assignment.assessment?.dueDiligence?.notes || "" },
  inspectionCosts: assignment.inspectionCosts?.length ? assignment.inspectionCosts : [{ label: "", amount: "" }],
});

function InstallerAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [reports, setReports] = useState({});
  const [schedule, setSchedule] = useState({});
  const [declineReason, setDeclineReason] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/installer/assignments`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load assignments.");
      setAssignments(data.assignments);
      setReports((current) => Object.fromEntries(data.assignments.map((assignment) => [assignment._id, current[assignment._id] || makeReport(assignment)])));
    } catch (error) {
      setMessage(error.message || "Could not load assignments.");
      if (/Unauthorized|expired/i.test(error.message || "")) navigate("/installer/login");
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const request = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok || !data.status) throw new Error(data.message || "Update failed.");
    return data;
  };

  const accept = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/accept`, {});
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setBusyId(""); }
  };

  const scheduleInspection = async (id, assignment) => {
    const details = schedule[id] || {};
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/accept`, { scheduledAt: details.scheduledAt, location: details.location || assignment.customer.location, inspectionFeeAmount: details.inspectionFeeAmount });
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setBusyId(""); }
  };

  const confirmPayment = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/payment-received`, {});
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setBusyId(""); }
  };

  const decline = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/decline`, { reason: declineReason[id] });
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setBusyId(""); }
  };

  const saveReport = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/report`, reports[id]);
      setMessage(data.message); await load();
    } catch (error) { setMessage(error.message); } finally { setBusyId(""); }
  };

  const updateReport = (id, section, field, value) => setReports((current) => ({ ...current, [id]: { ...current[id], [section]: { ...current[id][section], [field]: value } } }));
  const updateMaterial = (id, index, field, value) => setReports((current) => ({ ...current, [id]: { ...current[id], inspectionCosts: current[id].inspectionCosts.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } }));
  const installer = JSON.parse(localStorage.getItem("installerUser") || "{}");

  return (
    <main className="installer-workspace">
      <Helmet><title>Installer Assignments | BuiltRight</title></Helmet>
      <header className="installer-workspace-header"><div><p>BuiltRight field operations</p><h1>Welcome, {installer.fullName || "Installer"}</h1><span>Accept inspection jobs, schedule visits, and submit the assessment and material report.</span></div><button type="button" onClick={() => { localStorage.removeItem("installerToken"); localStorage.removeItem("installerUser"); navigate("/installer/login"); }}><FiLogOut /> Log out</button></header>
      {message && <p className="installer-workspace-message">{message}</p>}
      {loading ? <p className="installer-loading">Loading assignments...</p> : assignments.length === 0 ? <section className="installer-empty"><h2>No assignments yet</h2><p>New inspection assignments will appear here automatically.</p></section> : <section className="installer-assignment-list">
        {assignments.map((assignment) => {
          const report = reports[assignment._id] || makeReport(assignment);
          const assignmentStatus = assignment.installerAssignment?.status;
          const feeStatus = assignment.inspection?.feeStatus || "not-requested";
          const inspectionStarted = feeStatus === "payment-confirmed";
          return <article className="installer-assignment-card" key={assignment._id}>
            <header><div><span>{assignment.reference}</span><h2>{assignment.customer.fullName}</h2></div><i className={assignmentStatus}>{assignmentStatus}</i></header>
            <div className="installer-customer-grid"><div><FiPhone /><span>Customer phone</span><strong>{assignment.customer.phone}</strong></div><div><FiMapPin /><span>Project location</span><strong>{assignment.customer.location || "To be confirmed"}</strong></div><div><FiCalendar /><span>Inspection</span><strong>{assignment.inspection?.scheduledAt ? new Date(assignment.inspection.scheduledAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Awaiting acceptance"}</strong></div></div>
            {assignmentStatus === "assigned" && <div className="installer-response-grid">
              <section><h3>Accept assignment</h3><p>Call the customer using the number above to agree a convenient inspection time before scheduling the visit.</p><button className="installer-primary" type="button" disabled={busyId === assignment._id} onClick={() => accept(assignment._id)}><FiCheck /> Accept assignment</button></section>
              <section className="installer-decline"><h3>Decline assignment</h3><p>If you cannot take this inspection, the system will assign the next available installer.</p><textarea rows="4" placeholder="Optional reason" value={declineReason[assignment._id] || ""} onChange={(event) => setDeclineReason((current) => ({ ...current, [assignment._id]: event.target.value }))} /><button type="button" disabled={busyId === assignment._id} onClick={() => decline(assignment._id)}><FiX /> Decline & reassign</button></section>
            </div>}
            {assignmentStatus === "accepted" && !inspectionStarted && !["payment-requested", "proof-submitted"].includes(feeStatus) && <section className="installer-response-grid"><section><h3>Schedule inspection and request payment</h3><label>Date and time<input type="datetime-local" value={schedule[assignment._id]?.scheduledAt || ""} onChange={(event) => setSchedule((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], scheduledAt: event.target.value } }))} /></label><label>Inspection location<input value={schedule[assignment._id]?.location ?? assignment.customer.location ?? ""} onChange={(event) => setSchedule((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], location: event.target.value } }))} /></label><label>Inspection fee (NGN)<input type="number" min="1" value={schedule[assignment._id]?.inspectionFeeAmount || ""} onChange={(event) => setSchedule((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], inspectionFeeAmount: event.target.value } }))} /></label><button className="installer-primary" type="button" disabled={busyId === assignment._id} onClick={() => scheduleInspection(assignment._id, assignment)}><FiCalendar /> Schedule inspection & send payment request</button></section></section>}
            {((assignmentStatus === "scheduled") || (assignmentStatus === "accepted" && ["payment-requested", "proof-submitted"].includes(feeStatus))) && !inspectionStarted && <section className="installer-payment-status"><h3>Inspection fee status</h3><p>{feeStatus === "proof-submitted" ? "The customer uploaded payment proof. Review it, then confirm receipt to begin the inspection." : "Waiting for the customer to upload proof of inspection-fee payment."}</p>{feeStatus === "proof-submitted" && assignment.inspection?.paymentProof?.url && <a href={assignment.inspection.paymentProof.url} target="_blank" rel="noreferrer">View payment proof</a>}{feeStatus === "proof-submitted" && <button className="installer-primary" type="button" disabled={busyId === assignment._id} onClick={() => confirmPayment(assignment._id)}><FiCheck /> Confirm payment received & start inspection</button>}</section>}
            {(inspectionStarted || assignmentStatus === "completed") && <section className="installer-report"><div className="installer-report-head"><div><p>Field report</p><h3>Inspection, load audit, due diligence & materials</h3></div><span>Completing all passed checks generates and emails the final quotation automatically.</span></div><div className="installer-report-grid"><section><h4>Inspection report</h4><label>Status<select value={report.inspection.status} onChange={(event) => updateReport(assignment._id, "inspection", "status", event.target.value)}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="failed">Failed</option></select></label><label>Result<select value={report.inspection.result} onChange={(event) => updateReport(assignment._id, "inspection", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><label>Notes<textarea rows="3" value={report.inspection.notes} onChange={(event) => updateReport(assignment._id, "inspection", "notes", event.target.value)} /></label></section><section><h4>Load audit</h4><label>Status<select value={report.loadAudit.status} onChange={(event) => updateReport(assignment._id, "loadAudit", "status", event.target.value)}><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label><label>Result<select value={report.loadAudit.result} onChange={(event) => updateReport(assignment._id, "loadAudit", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><div className="installer-sizing-grid">{[["peakLoadKw", "Peak kW"], ["dailyEnergyKwh", "Daily kWh"], ["criticalLoadKw", "Critical kW"], ["recommendedInverterKva", "Inverter kVA"], ["recommendedBatteryKwh", "Battery kWh"], ["recommendedSolarKw", "Solar kW"], ["backupHours", "Backup hours"]].map(([field, label]) => <label key={field}>{label}<input type="number" min="0" step=".1" value={report.loadAudit[field]} onChange={(event) => updateReport(assignment._id, "loadAudit", field, event.target.value)} /></label>)}</div><label>Notes<textarea rows="3" value={report.loadAudit.notes} onChange={(event) => updateReport(assignment._id, "loadAudit", "notes", event.target.value)} /></label></section></div><section className="installer-due-diligence"><h4>Due diligence</h4><div>{report.dueDiligence.checklist.map((check, index) => <label key={check.key}><span>{check.label}</span><select value={check.status} onChange={(event) => setReports((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], dueDiligence: { ...current[assignment._id].dueDiligence, checklist: current[assignment._id].dueDiligence.checklist.map((item, itemIndex) => itemIndex === index ? { ...item, status: event.target.value } : item) } } }))}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option><option value="not-applicable">N/A</option></select></label>)}</div><label>Result<select value={report.dueDiligence.result} onChange={(event) => updateReport(assignment._id, "dueDiligence", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><label>Notes<textarea rows="3" value={report.dueDiligence.notes} onChange={(event) => updateReport(assignment._id, "dueDiligence", "notes", event.target.value)} /></label></section><section className="installer-materials"><div><h4>Installation materials and costs</h4><p>Add at least one confirmed material or work cost. The system includes these in the final quotation.</p></div>{report.inspectionCosts.map((item, index) => <div className="installer-material-row" key={`${index}-${item.label}`}><input placeholder="Material or work item" value={item.label} onChange={(event) => updateMaterial(assignment._id, index, "label", event.target.value)} /><input type="number" min="0" placeholder="Cost (NGN)" value={item.amount} onChange={(event) => updateMaterial(assignment._id, index, "amount", event.target.value)} /><button type="button" aria-label="Remove material" onClick={() => setReports((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], inspectionCosts: current[assignment._id].inspectionCosts.filter((_, itemIndex) => itemIndex !== index) } }))}><FiX /></button></div>)}<button type="button" className="installer-add-material" onClick={() => setReports((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], inspectionCosts: [...current[assignment._id].inspectionCosts, { label: "", amount: "" }] } }))}><FiPlus /> Add material</button></section><button className="installer-primary installer-save-report" type="button" disabled={busyId === assignment._id} onClick={() => saveReport(assignment._id)}><FiSave /> {busyId === assignment._id ? "Saving..." : "Save report & generate quotation if passed"}</button></section>}
          </article>;
        })}
      </section>}
    </main>
  );
}

export default InstallerAssignments;
