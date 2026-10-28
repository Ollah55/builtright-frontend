import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiCalendar, FiCheck, FiLogOut, FiMapPin, FiPhone, FiPlus, FiSave, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import applianceOptions from "../../data/applianceOptions";
import useLiveRefresh from "../../hooks/useLiveRefresh";
import "./installerAssignments.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://builtright-backend-1.onrender.com";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("installerToken")}` });

const checklistDefaults = [
  { key: "identity-contact", label: "Customer identity and contact verified", status: "pending" },
  { key: "property-authority", label: "Property ownership or installation authority verified", status: "pending" },
  { key: "site-access", label: "Site access and installation permissions confirmed", status: "pending" },
  { key: "technical-suitability", label: "Roof, electrical, and structural suitability confirmed", status: "pending" },
  { key: "financing-consent", label: "Financing data-sharing consent recorded", status: "pending" },
];

const emptyAppliance = () => ({ name: "", quantity: 1, watts: "", hoursPerDay: "", critical: false, isCustom: false });
const knownApplianceNames = new Set(applianceOptions.map((item) => item.name));
const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const prepareAppliances = (appliances = []) => {
  const rows = appliances.map((item) => ({
    name: item.name || "",
    quantity: item.quantity ?? 1,
    watts: item.watts ?? "",
    hoursPerDay: item.hoursPerDay ?? "",
    critical: Boolean(item.critical),
    isCustom: Boolean(item.name) && !knownApplianceNames.has(item.name),
  }));
  return rows.length ? rows : [emptyAppliance()];
};

const withCalculatedAuditTotals = (loadAudit, appliances) => {
  const validRows = appliances.filter((item) => item.name && numberValue(item.watts) > 0 && numberValue(item.quantity) > 0);
  const peakLoadKw = validRows.reduce((total, item) => total + (numberValue(item.watts) * numberValue(item.quantity)), 0) / 1000;
  const dailyEnergyKwh = validRows.reduce((total, item) => total + (numberValue(item.watts) * numberValue(item.quantity) * numberValue(item.hoursPerDay)), 0) / 1000;
  const criticalLoadKw = validRows.filter((item) => item.critical).reduce((total, item) => total + (numberValue(item.watts) * numberValue(item.quantity)), 0) / 1000;
  return {
    ...loadAudit,
    appliances,
    peakLoadKw: peakLoadKw ? Number(peakLoadKw.toFixed(3)) : "",
    dailyEnergyKwh: dailyEnergyKwh ? Number(dailyEnergyKwh.toFixed(3)) : "",
    criticalLoadKw: criticalLoadKw ? Number(criticalLoadKw.toFixed(3)) : "",
  };
};

const makeReport = (assignment) => ({
  assignmentRevision: Number(assignment.installerAssignment?.revision || 0),
  inspection: { status: assignment.assessment?.inspection?.status || "scheduled", result: assignment.assessment?.inspection?.result || "pending", notes: assignment.assessment?.inspection?.notes || "" },
  siteDetails: { propertyType: assignment.inspection?.propertyType || "", cableDistance: assignment.inspection?.cableDistance || "", mountingMethod: assignment.inspection?.mountingMethod || "", notes: assignment.inspection?.notes || "" },
  loadAudit: { status: assignment.assessment?.loadAudit?.status || "pending", result: assignment.assessment?.loadAudit?.result || "pending", peakLoadKw: assignment.assessment?.loadAudit?.peakLoadKw ?? "", dailyEnergyKwh: assignment.assessment?.loadAudit?.dailyEnergyKwh ?? "", criticalLoadKw: assignment.assessment?.loadAudit?.criticalLoadKw ?? "", recommendedInverterKva: assignment.assessment?.loadAudit?.recommendedInverterKva ?? "", recommendedBatteryKwh: assignment.assessment?.loadAudit?.recommendedBatteryKwh ?? "", recommendedSolarKw: assignment.assessment?.loadAudit?.recommendedSolarKw ?? "", backupHours: assignment.assessment?.loadAudit?.backupHours ?? "", appliances: prepareAppliances(assignment.assessment?.loadAudit?.appliances), notes: assignment.assessment?.loadAudit?.notes || "" },
  dueDiligence: { status: assignment.assessment?.dueDiligence?.status || "pending", result: assignment.assessment?.dueDiligence?.result || "pending", checklist: assignment.assessment?.dueDiligence?.checklist?.length ? assignment.assessment.dueDiligence.checklist : checklistDefaults, notes: assignment.assessment?.dueDiligence?.notes || "" },
  inspectionCosts: assignment.inspectionCosts?.length ? assignment.inspectionCosts : [{ label: "", amount: "" }],
});

function InstallerAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [reports, setReports] = useState({});
  const [declineReason, setDeclineReason] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async ({ silent = false, resetReports = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/installer/assignments`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load assignments.");
      setAssignments(data.assignments);
      setReports((current) => Object.fromEntries(data.assignments.map((assignment) => [
        assignment._id,
        resetReports ? makeReport(assignment) : current[assignment._id] || makeReport(assignment),
      ])));
    } catch (error) {
      setMessage(error.message || "Could not load assignments.");
      if (/Unauthorized|expired/i.test(error.message || "")) navigate("/installer/login");
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);
  useLiveRefresh(load);

  const request = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok || !data.status) {
      const error = new Error(data.message || "Update failed.");
      error.code = data.code || "";
      throw error;
    }
    return data;
  };

  const handleUpdateError = async (error) => {
    setMessage(error.message || "Update failed.");
    if (error.code === "ASSIGNMENT_CHANGED") {
      await load({ silent: true, resetReports: true });
    }
  };

  const revisionFor = (id) => Number(
    assignments.find((assignment) => assignment._id === id)?.installerAssignment?.revision || 0,
  );

  const accept = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/accept`, { assignmentRevision: revisionFor(id) });
      setMessage(data.message); await load({ resetReports: true });
    } catch (error) { await handleUpdateError(error); } finally { setBusyId(""); }
  };

  const scheduleInspection = async (event, id) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const details = {
      scheduledAt: String(formData.get("scheduledAt") || "").trim(),
      assignmentRevision: revisionFor(id),
    };
    try {
      setBusyId(id); setMessage("");
      if (!details.scheduledAt) throw new Error("Enter the inspection date and time.");
      const data = await request(`/api/installer/assignments/${id}/accept`, details);
      setMessage(data.message); await load({ resetReports: true });
    } catch (error) { await handleUpdateError(error); } finally { setBusyId(""); }
  };

  const decline = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/decline`, { reason: declineReason[id], assignmentRevision: revisionFor(id) });
      setMessage(data.message); await load({ resetReports: true });
    } catch (error) { await handleUpdateError(error); } finally { setBusyId(""); }
  };

  const saveReport = async (id) => {
    try {
      setBusyId(id); setMessage("");
      const data = await request(`/api/installer/assignments/${id}/report`, reports[id]);
      setMessage(data.message); await load({ resetReports: true });
    } catch (error) { await handleUpdateError(error); } finally { setBusyId(""); }
  };

  const updateReport = (id, section, field, value) => setReports((current) => ({ ...current, [id]: { ...current[id], [section]: { ...current[id][section], [field]: value } } }));
  const updateAppliance = (id, index, field, value) => setReports((current) => {
    const currentReport = current[id];
    const appliances = currentReport.loadAudit.appliances.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (field === "selection") {
        if (value === "__other__") return { ...item, name: "", watts: "", isCustom: true };
        const selected = applianceOptions.find((option) => option.name === value);
        return { ...item, name: value, watts: selected?.watts ?? "", isCustom: false };
      }
      return { ...item, [field]: value };
    });
    return { ...current, [id]: { ...currentReport, loadAudit: withCalculatedAuditTotals(currentReport.loadAudit, appliances) } };
  });
  const addAppliance = (id) => setReports((current) => {
    const currentReport = current[id];
    const appliances = [...currentReport.loadAudit.appliances, emptyAppliance()];
    return { ...current, [id]: { ...currentReport, loadAudit: withCalculatedAuditTotals(currentReport.loadAudit, appliances) } };
  });
  const removeAppliance = (id, index) => setReports((current) => {
    const currentReport = current[id];
    const remaining = currentReport.loadAudit.appliances.filter((_, itemIndex) => itemIndex !== index);
    const appliances = remaining.length ? remaining : [emptyAppliance()];
    return { ...current, [id]: { ...currentReport, loadAudit: withCalculatedAuditTotals(currentReport.loadAudit, appliances) } };
  });
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
            {assignmentStatus === "accepted" && !inspectionStarted && !["payment-requested", "proof-submitted"].includes(feeStatus) && <section className="installer-response-grid"><form onSubmit={(event) => scheduleInspection(event, assignment._id)}><h3>Schedule inspection</h3><p>Choose the agreed date and time. BuiltRight will send the customer their payment details by email and SMS. The assessment fee is managed privately by sales.</p><label>Date and time<input name="scheduledAt" type="datetime-local" required /></label><button className="installer-primary" type="submit" disabled={busyId === assignment._id}><FiCalendar /> {busyId === assignment._id ? "Scheduling..." : "Schedule inspection & notify customer"}</button></form></section>}
            {((assignmentStatus === "scheduled") || (assignmentStatus === "accepted" && ["payment-requested", "proof-submitted"].includes(feeStatus))) && !inspectionStarted && <section className="installer-payment-status"><h3>Assessment clearance</h3><p>{feeStatus === "proof-submitted" ? "The customer has submitted payment proof. Sales is reviewing it and will notify you when the assessment is cleared to proceed." : "Waiting for the customer to complete the assessment-payment process with sales."}</p></section>}
            {(inspectionStarted || assignmentStatus === "completed") && <section className="installer-report"><div className="installer-report-head"><div><p>Field report</p><h3>Site assessment, load audit, due diligence & materials</h3></div><span>Record every appliance verified on site. The system calculates the connected load and daily energy automatically for sales to use in the recommendation and quotation.</span></div><div className="installer-report-grid"><section><h4>Site assessment</h4><label>Status<select value={report.inspection.status} onChange={(event) => updateReport(assignment._id, "inspection", "status", event.target.value)}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="failed">Failed</option></select></label><label>Result<select value={report.inspection.result} onChange={(event) => updateReport(assignment._id, "inspection", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><label>Property type<input value={report.siteDetails.propertyType} onChange={(event)=>updateReport(assignment._id,"siteDetails","propertyType",event.target.value)}/></label><label>Cable distance<input value={report.siteDetails.cableDistance} onChange={(event)=>updateReport(assignment._id,"siteDetails","cableDistance",event.target.value)}/></label><label>Mounting method<input value={report.siteDetails.mountingMethod} onChange={(event)=>updateReport(assignment._id,"siteDetails","mountingMethod",event.target.value)}/></label><label>Inspection notes<textarea rows="3" value={report.inspection.notes} onChange={(event) => updateReport(assignment._id, "inspection", "notes", event.target.value)} /></label></section><section><h4>Load audit status & recommendation</h4><label>Status<select value={report.loadAudit.status} onChange={(event) => updateReport(assignment._id, "loadAudit", "status", event.target.value)}><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label><label>Result<select value={report.loadAudit.result} onChange={(event) => updateReport(assignment._id, "loadAudit", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><div className="installer-sizing-grid">{[["peakLoadKw", "Connected load (kW)", true], ["dailyEnergyKwh", "Daily energy (kWh)", true], ["criticalLoadKw", "Critical load (kW)", true], ["recommendedInverterKva", "Inverter (kVA)"], ["recommendedBatteryKwh", "Battery (kWh)"], ["recommendedSolarKw", "Solar array (kW)"], ["backupHours", "Backup hours"]].map(([field, label, calculated]) => <label key={field}>{label}<input readOnly={calculated} type="number" min="0" step=".1" value={report.loadAudit[field]} onChange={(event) => updateReport(assignment._id, "loadAudit", field, event.target.value)} /></label>)}</div><label>Notes<textarea rows="3" value={report.loadAudit.notes} onChange={(event) => updateReport(assignment._id, "loadAudit", "notes", event.target.value)} /></label></section></div><section className="installer-appliances"><div className="installer-appliances-head"><div><h4>Appliances and daily usage</h4><p>Select a common appliance or choose Other appliance to type one that is not listed. Confirm the actual wattage from the appliance label whenever possible.</p></div><button type="button" className="installer-add-material" onClick={() => addAppliance(assignment._id)}><FiPlus /> Add appliance</button></div><div className="installer-appliance-table"><div className="installer-appliance-header"><span>Appliance</span><span>Wattage</span><span>Quantity</span><span>Hours/day</span><span>Critical</span><span>Daily kWh</span><span></span></div>{report.loadAudit.appliances.map((item, index) => <div className="installer-appliance-row" key={`${assignment._id}-appliance-${index}`}><div className="installer-appliance-name"><select aria-label="Appliance" value={item.isCustom ? "__other__" : item.name} onChange={(event) => updateAppliance(assignment._id, index, "selection", event.target.value)}><option value="">Select appliance</option>{applianceOptions.map((option) => <option key={option.name} value={option.name}>{option.name}</option>)}<option value="__other__">Other appliance</option></select>{item.isCustom && <input aria-label="Other appliance name" placeholder="Type appliance name" value={item.name} onChange={(event) => updateAppliance(assignment._id, index, "name", event.target.value)} />}</div><input aria-label="Wattage" type="number" min="0" inputMode="decimal" placeholder="Watts" value={item.watts} onChange={(event) => updateAppliance(assignment._id, index, "watts", event.target.value)} /><input aria-label="Quantity" type="number" min="1" inputMode="numeric" value={item.quantity} onChange={(event) => updateAppliance(assignment._id, index, "quantity", event.target.value)} /><input aria-label="Hours used daily" type="number" min="0" max="24" step=".5" inputMode="decimal" placeholder="Hours" value={item.hoursPerDay} onChange={(event) => updateAppliance(assignment._id, index, "hoursPerDay", event.target.value)} /><label className="installer-critical-check"><input type="checkbox" checked={item.critical} onChange={(event) => updateAppliance(assignment._id, index, "critical", event.target.checked)} /><span>Yes</span></label><output>{((numberValue(item.watts) * numberValue(item.quantity) * numberValue(item.hoursPerDay)) / 1000).toFixed(2)}</output><button type="button" aria-label="Remove appliance" onClick={() => removeAppliance(assignment._id, index)}><FiX /></button></div>)}</div><div className="installer-audit-totals"><div><span>Connected load</span><strong>{numberValue(report.loadAudit.peakLoadKw).toFixed(2)} kW</strong></div><div><span>Daily energy</span><strong>{numberValue(report.loadAudit.dailyEnergyKwh).toFixed(2)} kWh</strong></div><div><span>Critical load</span><strong>{numberValue(report.loadAudit.criticalLoadKw).toFixed(2)} kW</strong></div></div></section><section className="installer-due-diligence"><h4>Due diligence</h4><div>{report.dueDiligence.checklist.map((check, index) => <label key={check.key}><span>{check.label}</span><select value={check.status} onChange={(event) => setReports((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], dueDiligence: { ...current[assignment._id].dueDiligence, checklist: current[assignment._id].dueDiligence.checklist.map((item, itemIndex) => itemIndex === index ? { ...item, status: event.target.value } : item) } } }))}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option><option value="not-applicable">N/A</option></select></label>)}</div><label>Result<select value={report.dueDiligence.result} onChange={(event) => updateReport(assignment._id, "dueDiligence", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><label>Notes<textarea rows="3" value={report.dueDiligence.notes} onChange={(event) => updateReport(assignment._id, "dueDiligence", "notes", event.target.value)} /></label></section><section className="installer-materials"><div><h4>Installation materials and costs</h4><p>Record the confirmed materials and site work. Sales will use them when preparing the quotation.</p></div>{report.inspectionCosts.map((item, index) => <div className="installer-material-row" key={`${index}-${item.label}`}><input placeholder="Material or work item" value={item.label} onChange={(event) => updateMaterial(assignment._id, index, "label", event.target.value)} /><input type="number" min="0" placeholder="Cost (NGN)" value={item.amount} onChange={(event) => updateMaterial(assignment._id, index, "amount", event.target.value)} /><button type="button" aria-label="Remove material" onClick={() => setReports((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], inspectionCosts: current[assignment._id].inspectionCosts.filter((_, itemIndex) => itemIndex !== index) } }))}><FiX /></button></div>)}<button type="button" className="installer-add-material" onClick={() => setReports((current) => ({ ...current, [assignment._id]: { ...current[assignment._id], inspectionCosts: [...current[assignment._id].inspectionCosts, { label: "", amount: "" }] } }))}><FiPlus /> Add material</button></section><button className="installer-primary installer-save-report" type="button" disabled={busyId === assignment._id} onClick={() => saveReport(assignment._id)}><FiSave /> {busyId === assignment._id ? "Saving..." : "Save site-assessment report"}</button></section>}
          </article>;
        })}
      </section>}
    </main>
  );
}

export default InstallerAssignments;
