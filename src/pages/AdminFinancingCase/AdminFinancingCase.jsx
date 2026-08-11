import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiClipboard,
  FiDownload,
  FiFileText,
  FiPlus,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import {
  demoFinancingRequests,
  demoProjectDocuments,
  formatMoney,
  getFinancingStage,
  isAssessmentPricingUnlocked,
  isInstallationCostLabel,
  statusTone,
} from "../../lib/operations";
import { isDevelopmentPreview } from "../../lib/previewMode";
import { downloadProjectDocument } from "../../lib/projectDocumentPdf";
import "./adminFinancingCase.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://builtright-backend.onrender.com";

const dueDiligenceDefaults = [
  { key: "identity-contact", label: "Customer identity and contact verified", status: "pending", note: "" },
  { key: "property-authority", label: "Property ownership or installation authority verified", status: "pending", note: "" },
  { key: "site-access", label: "Site access and installation permissions confirmed", status: "pending", note: "" },
  { key: "technical-suitability", label: "Roof, electrical, and structural suitability confirmed", status: "pending", note: "" },
  { key: "financing-consent", label: "Financing data-sharing consent recorded", status: "pending", note: "" },
];

const categoryOptions = [
  ["solar-system", "Solar system"],
  ["installation-service", "Installation service"],
  ["insurance-compliance", "Insurance / compliance"],
  ["iot-tracking", "IoT tracking"],
  ["maintenance", "Maintenance"],
  ["installation-materials", "Installation materials"],
  ["mounting-materials", "Mounting materials"],
  ["cables", "Cables"],
  ["protection-accessories", "DB / protection accessories"],
  ["civil-electrical-work", "Civil / electrical work"],
  ["other", "Other"],
];

const defaultAssessment = {
  status: "open",
  inspection: { status: "pending", result: "pending", completedBy: "", notes: "" },
  loadAudit: {
    status: "pending",
    result: "pending",
    peakLoadKw: "",
    dailyEnergyKwh: "",
    criticalLoadKw: "",
    recommendedInverterKva: "",
    recommendedBatteryKwh: "",
    recommendedSolarKw: "",
    backupHours: "",
    completedBy: "",
    notes: "",
  },
  dueDiligence: { status: "pending", result: "pending", checklist: dueDiligenceDefaults, completedBy: "", notes: "" },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function normalizeAssessment(value = {}) {
  return {
    ...clone(defaultAssessment),
    ...clone(value),
    inspection: { ...clone(defaultAssessment.inspection), ...clone(value.inspection || {}) },
    loadAudit: { ...clone(defaultAssessment.loadAudit), ...clone(value.loadAudit || {}) },
    dueDiligence: {
      ...clone(defaultAssessment.dueDiligence),
      ...clone(value.dueDiligence || {}),
      checklist: value.dueDiligence?.checklist?.length
        ? clone(value.dueDiligence.checklist)
        : clone(dueDiligenceDefaults),
    },
  };
}

function buildDefaultLineItems(financingCase) {
  const upfrontCategories = ["solar-system", "installation-service", "insurance-compliance", "iot-tracking", "maintenance"];
  const inspectionCategories = ["installation-materials", "mounting-materials", "cables", "protection-accessories", "civil-electrical-work"];
  const installationPricingUnlocked = isAssessmentPricingUnlocked(financingCase);
  return [
    ...(financingCase?.upfrontCosts || []).map((item, index) => ({
      category: upfrontCategories[index] || "other",
      description: item.label,
      quantity: 1,
      unit: "item",
      unitPrice: isInstallationCostLabel(item.label) && !installationPricingUnlocked ? 0 : Number(item.amount || 0),
      source: "confirmed",
    })),
    ...(financingCase?.inspectionCosts || []).map((item, index) => ({
      category: inspectionCategories[index] || "other",
      description: item.label,
      quantity: 1,
      unit: "lot",
      unitPrice: installationPricingUnlocked ? Number(item.amount || 0) : 0,
      source: "inspection",
    })),
  ];
}

function AdminFinancingCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const preview = isDevelopmentPreview();
  const previewCase = demoFinancingRequests.find((item) => item._id === id) || demoFinancingRequests[1];
  const [financingCase, setFinancingCase] = useState(preview ? clone(previewCase) : null);
  const [documents, setDocuments] = useState(
    preview ? clone(demoProjectDocuments.filter((item) => item.financingRequest === previewCase._id)) : []
  );
  const [activeTab, setActiveTab] = useState("assessment");
  const [assessment, setAssessment] = useState(normalizeAssessment(previewCase.assessment));
  const [lineItems, setLineItems] = useState(buildDefaultLineItems(previewCase));
  const [quoteMeta, setQuoteMeta] = useState({
    title: `${previewCase.systemCapacity || "Solar"} project quotation`,
    systemName: previewCase.systemName || "",
    systemCapacity: previewCase.systemCapacity || "",
    siteAddress: previewCase.customer?.location || "",
    propertyType: previewCase.inspection?.property || "",
    cableDistance: "",
    mountingMethod: "",
    scope: "Supply, install, test, commission, monitor, and maintain the complete solar power system described in this quotation.",
    equityPercentage: 20,
    discount: 0,
    tax: 0,
    validUntil: "",
    terms: "Customer approval is required before the bank credit application becomes available. Delivery and installation begin only after the equity deposit and bank disbursement are confirmed.",
    notes: "",
  });
  const [loading, setLoading] = useState(!preview);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (preview) return;
    const loadWorkspace = async () => {
      try {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests/${id}/workspace`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Could not load case workspace.");
        setFinancingCase(data.loanRequest);
        setDocuments(data.documents || []);
        setAssessment(normalizeAssessment(data.loanRequest.assessment));
        const latestQuote = (data.documents || []).find((document) => document.type === "quotation");
        setLineItems(latestQuote?.lineItems?.length ? latestQuote.lineItems : buildDefaultLineItems(data.loanRequest));
        if (latestQuote) {
          setQuoteMeta((current) => ({
            ...current,
            title: latestQuote.title,
            ...latestQuote.project,
            equityPercentage: latestQuote.equityPercentage,
            discount: latestQuote.discount,
            tax: latestQuote.tax,
            validUntil: latestQuote.validUntil ? new Date(latestQuote.validUntil).toISOString().slice(0, 10) : "",
            terms: latestQuote.terms,
            notes: latestQuote.notes,
          }));
        }
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspace();
  }, [id, preview]);

  const latestQuotation = documents.find((document) => document.type === "quotation") || null;
  const assessmentPassed = financingCase?.assessment?.status === "passed" || assessment.status === "passed";
  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
    const total = Math.max(0, subtotal - Number(quoteMeta.discount || 0) + Number(quoteMeta.tax || 0));
    const equityAmount = total * 0.2;
    return { subtotal, total, equityAmount, bankFinanceAmount: total - equityAmount };
  }, [lineItems, quoteMeta.discount, quoteMeta.tax]);

  const updateAssessment = (section, field, value) => {
    setAssessment((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  };

  const saveAssessment = async () => {
    setSaving(true);
    setMessage("");
    try {
      const completeInspection = assessment.inspection.result === "pass";
      const requiredLoadAuditValues = [
        assessment.loadAudit.peakLoadKw,
        assessment.loadAudit.dailyEnergyKwh,
        assessment.loadAudit.recommendedInverterKva,
        assessment.loadAudit.recommendedBatteryKwh,
        assessment.loadAudit.recommendedSolarKw,
      ];
      const loadAuditHasSizing = requiredLoadAuditValues.every((value) => Number(value) > 0);
      if (assessment.loadAudit.result === "pass" && !loadAuditHasSizing) {
        throw new Error("Complete the peak load, daily energy, inverter, battery, and solar sizing before passing the load audit.");
      }
      const completeLoadAudit = assessment.loadAudit.result === "pass" && loadAuditHasSizing;
      const completeDueDiligence = assessment.dueDiligence.checklist.length > 0 && assessment.dueDiligence.checklist.every((item) => ["pass", "not-applicable"].includes(item.status));
      const payload = {
        inspection: { ...assessment.inspection, status: completeInspection ? "completed" : assessment.inspection.status },
        loadAudit: { ...assessment.loadAudit, status: completeLoadAudit ? "completed" : assessment.loadAudit.status },
        dueDiligence: {
          ...assessment.dueDiligence,
          status: completeDueDiligence ? "completed" : assessment.dueDiligence.status,
          result: completeDueDiligence ? "pass" : assessment.dueDiligence.result,
        },
      };

      if (preview) {
        const passed = completeInspection && completeLoadAudit && completeDueDiligence;
        const updated = { ...financingCase, assessment: { ...payload, status: passed ? "passed" : "in-progress" }, status: passed ? "due-diligence-passed" : financingCase.status };
        setFinancingCase(updated);
        setAssessment(updated.assessment);
        setMessage(passed ? "All pre-credit checks passed. Quotation preparation is unlocked." : "Preview assessment saved.");
      } else {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests/${id}/assessment`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Assessment could not be saved.");
        setFinancingCase(data.loanRequest);
        setAssessment(normalizeAssessment(data.loanRequest.assessment));
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateLineItem = (index, field, value) => {
    setLineItems((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const generateQuotation = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        title: quoteMeta.title,
        project: {
          systemName: quoteMeta.systemName,
          systemCapacity: quoteMeta.systemCapacity,
          siteAddress: quoteMeta.siteAddress,
          propertyType: quoteMeta.propertyType,
          cableDistance: quoteMeta.cableDistance,
          mountingMethod: quoteMeta.mountingMethod,
          scope: quoteMeta.scope,
        },
        lineItems,
        equityPercentage: 20,
        discount: Number(quoteMeta.discount),
        tax: Number(quoteMeta.tax),
        validUntil: quoteMeta.validUntil || null,
        terms: quoteMeta.terms,
        notes: quoteMeta.notes,
      };
      if (preview) {
        if (!assessmentPassed) throw new Error("Complete and pass all pre-credit checks first.");
        if (totals.total <= 0) throw new Error("Add the complete project costs before generating the quotation.");
        const version = documents.filter((document) => document.type === "quotation").length + 1;
        const quotation = {
          _id: `preview-quote-${Date.now()}`,
          reference: `BRQ-${financingCase.reference.replace("BRF-", "")}-V${version}`,
          financingRequest: financingCase._id,
          type: "quotation",
          version,
          status: "draft",
          title: payload.title,
          customer: financingCase.customer,
          project: payload.project,
          lineItems: lineItems.map((item) => ({ ...item, amount: Number(item.quantity || 0) * Number(item.unitPrice || 0) })),
          ...totals,
          equityPercentage: 20,
          discount: Number(quoteMeta.discount),
          tax: Number(quoteMeta.tax),
          terms: quoteMeta.terms,
          notes: quoteMeta.notes,
          validUntil: quoteMeta.validUntil || null,
          customerDecision: { status: "pending" },
          createdAt: new Date().toISOString(),
        };
        setDocuments((items) => [quotation, ...items]);
        setFinancingCase((item) => ({ ...item, status: "quotation-draft", finalProjectCost: totals.total, quotation: { status: "draft", reference: quotation.reference, version } }));
        setMessage("Quotation draft generated in preview mode.");
      } else {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests/${id}/quotation`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Quotation could not be generated.");
        setDocuments((items) => [data.quotation, ...items]);
        setFinancingCase(data.loanRequest);
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const sendQuotation = async () => {
    if (!latestQuotation) return;
    setSaving(true);
    setMessage("");
    try {
      if (preview) {
        const sentAt = new Date().toISOString();
        setDocuments((items) => items.map((item) => item._id === latestQuotation._id ? { ...item, status: "sent", sentAt } : item));
        setFinancingCase((item) => ({ ...item, status: "quotation-sent", quotation: { ...item.quotation, status: "sent", sentAt } }));
        setMessage("Quotation marked as emailed to the customer in preview mode.");
      } else {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests/${id}/quotation/${latestQuotation._id}/send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Quotation could not be sent.");
        setDocuments((items) => items.map((item) => item._id === data.quotation._id ? data.quotation : item));
        setFinancingCase(data.loanRequest);
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const sendInvoice = async (projectDocument) => {
    setSaving(true);
    setMessage("");
    try {
      if (preview) {
        const sentAt = new Date().toISOString();
        setDocuments((items) => items.map((item) => item._id === projectDocument._id
          ? { ...item, sentAt, emailDelivery: { status: "sent", sentAt, error: "" } }
          : item));
        setMessage("Invoice marked as emailed to the customer in preview mode.");
      } else {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests/${id}/documents/${projectDocument._id}/send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Invoice could not be sent.");
        setDocuments((items) => items.map((item) => item._id === data.document._id ? data.document : item));
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !financingCase) {
    return <AdminLayout title="Financing case" subtitle="Loading assessment and project documents..."><section className="ops-card financing-workspace-loading">Loading case workspace...</section></AdminLayout>;
  }

  return (
    <AdminLayout
      title={`${financingCase.reference} · ${financingCase.customer?.fullName}`}
      subtitle="Complete the pre-credit assessment, build the full project quotation, and send it to the customer for approval before bank handoff."
      actions={<button className="ops-button secondary" type="button" onClick={() => navigate("/admin/loan-requests")}><FiArrowLeft /> Back to financing</button>}
    >
      <section className="case-workspace-summary ops-card">
        <div><span>Current stage</span><strong className={`status-pill ${statusTone(financingCase.status)}`}>{getFinancingStage(financingCase.status).label}</strong></div>
        <div><span>System</span><strong>{financingCase.systemCapacity || financingCase.items?.[0]?.capacity || "Sizing pending"}</strong></div>
        <div><span>Site</span><strong>{financingCase.customer?.location || "Location pending"}</strong></div>
        <div><span>Final project cost</span><strong>{formatMoney(financingCase.finalProjectCost)}</strong></div>
      </section>

      {message && <div className="finance-message" role="status">{message}</div>}

      <div className="case-workspace-tabs" role="tablist">
        <button type="button" className={activeTab === "assessment" ? "active" : ""} onClick={() => setActiveTab("assessment")}><FiClipboard /> Assessment</button>
        <button type="button" className={activeTab === "quotation" ? "active" : ""} onClick={() => setActiveTab("quotation")}><FiFileText /> Quotation</button>
        <button type="button" className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}><FiDownload /> Documents</button>
      </div>

      {activeTab === "assessment" && (
        <section className="assessment-workspace">
          <article className="assessment-card ops-card">
            <header><span>01</span><div><h2>Site inspection</h2><p>Confirm the property, cable distance, mounting method, structure, DB and protection requirements.</p></div></header>
            <div className="assessment-form-grid">
              <label><span>Status</span><select value={assessment.inspection.status} onChange={(event) => updateAssessment("inspection", "status", event.target.value)}><option value="pending">Pending</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="failed">Failed</option></select></label>
              <label><span>Result</span><select value={assessment.inspection.result} onChange={(event) => updateAssessment("inspection", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label>
              <label><span>Completed by</span><input value={assessment.inspection.completedBy || ""} onChange={(event) => updateAssessment("inspection", "completedBy", event.target.value)} /></label>
              <label className="wide"><span>Inspection notes</span><textarea rows="3" value={assessment.inspection.notes || ""} onChange={(event) => updateAssessment("inspection", "notes", event.target.value)} /></label>
            </div>
          </article>

          <article className="assessment-card ops-card">
            <header><span>02</span><div><h2>Load audit</h2><p>Record measured energy needs and the system sizing recommendation used for the quotation.</p></div></header>
            <div className="assessment-form-grid audit-grid">
              <label><span>Status</span><select value={assessment.loadAudit.status} onChange={(event) => updateAssessment("loadAudit", "status", event.target.value)}><option value="pending">Pending</option><option value="in-progress">In progress</option><option value="completed">Completed</option><option value="failed">Failed</option></select></label>
              <label><span>Result</span><select value={assessment.loadAudit.result} onChange={(event) => updateAssessment("loadAudit", "result", event.target.value)}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label>
              {[["peakLoadKw", "Peak load (kW)"], ["dailyEnergyKwh", "Daily energy (kWh)"], ["criticalLoadKw", "Critical load (kW)"], ["recommendedInverterKva", "Recommended inverter (kVA)"], ["recommendedBatteryKwh", "Battery storage (kWh)"], ["recommendedSolarKw", "Solar array (kW)"], ["backupHours", "Target backup hours"]].map(([field, label]) => <label key={field}><span>{label}</span><input type="number" min="0" step="0.1" value={assessment.loadAudit[field] ?? ""} onChange={(event) => updateAssessment("loadAudit", field, event.target.value)} /></label>)}
              <label><span>Completed by</span><input value={assessment.loadAudit.completedBy || ""} onChange={(event) => updateAssessment("loadAudit", "completedBy", event.target.value)} /></label>
              <label className="wide"><span>Load audit notes</span><textarea rows="3" value={assessment.loadAudit.notes || ""} onChange={(event) => updateAssessment("loadAudit", "notes", event.target.value)} /></label>
            </div>
          </article>

          <article className="assessment-card ops-card">
            <header><span>03</span><div><h2>Due diligence</h2><p>Every required customer, property, safety and consent check must pass before quotation generation unlocks.</p></div></header>
            <div className="due-diligence-list">
              {(assessment.dueDiligence.checklist?.length ? assessment.dueDiligence.checklist : dueDiligenceDefaults).map((item, index) => (
                <div key={item.key}>
                  <span>{item.label}</span>
                  <select value={item.status} onChange={(event) => setAssessment((current) => ({ ...current, dueDiligence: { ...current.dueDiligence, checklist: current.dueDiligence.checklist.map((check, checkIndex) => checkIndex === index ? { ...check, status: event.target.value } : check) } }))}><option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option><option value="not-applicable">N/A</option></select>
                </div>
              ))}
            </div>
            <label className="assessment-wide-field"><span>Due-diligence notes</span><textarea rows="3" value={assessment.dueDiligence.notes || ""} onChange={(event) => updateAssessment("dueDiligence", "notes", event.target.value)} /></label>
          </article>

          <div className="case-workspace-actions"><button className="ops-button primary" type="button" disabled={saving} onClick={saveAssessment}><FiCheck /> {saving ? "Saving..." : "Save assessment"}</button></div>
        </section>
      )}

      {activeTab === "quotation" && (
        <section className="quotation-workspace">
          {!assessmentPassed && <div className="quotation-lock"><FiClipboard /><div><strong>Quotation locked</strong><p>Inspection, load audit and all due-diligence checks must pass first.</p></div></div>}
          <article className={`ops-card quotation-builder ${!assessmentPassed ? "locked" : ""}`}>
            <div className="quotation-project-grid">
              {[["title", "Quotation title"], ["systemName", "System name"], ["systemCapacity", "System capacity"], ["siteAddress", "Project site"], ["propertyType", "Property type"], ["cableDistance", "Cable distance"], ["mountingMethod", "Mounting method"]].map(([field, label]) => <label key={field}><span>{label}</span><input value={quoteMeta[field]} onChange={(event) => setQuoteMeta((current) => ({ ...current, [field]: event.target.value }))} disabled={!assessmentPassed} /></label>)}
              <label className="wide"><span>Full project scope</span><textarea rows="4" value={quoteMeta.scope} onChange={(event) => setQuoteMeta((current) => ({ ...current, scope: event.target.value }))} disabled={!assessmentPassed} /></label>
            </div>

            <div className="quotation-line-head"><div><p className="ops-section-kicker">Cost breakdown</p><h2>Full project line items</h2></div><button type="button" className="ops-button secondary" disabled={!assessmentPassed} onClick={() => setLineItems((items) => [...items, { category: "other", description: "", quantity: 1, unit: "item", unitPrice: 0, source: "manual" }])}><FiPlus /> Add item</button></div>
            <div className="quotation-line-table">
              <div className="quotation-line-row header"><span>Category</span><span>Description</span><span>Qty</span><span>Unit</span><span>Unit price</span><span>Amount</span><span /></div>
              {lineItems.map((item, index) => (
                <div className="quotation-line-row" key={`${item.description}-${index}`}>
                  <select value={item.category} onChange={(event) => updateLineItem(index, "category", event.target.value)} disabled={!assessmentPassed}>{categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                  <input value={item.description} onChange={(event) => updateLineItem(index, "description", event.target.value)} disabled={!assessmentPassed} />
                  <input type="number" min="0" step="1" value={item.quantity} onChange={(event) => updateLineItem(index, "quantity", event.target.value)} disabled={!assessmentPassed} />
                  <input value={item.unit} onChange={(event) => updateLineItem(index, "unit", event.target.value)} disabled={!assessmentPassed} />
                  <input type="number" min="0" step="1000" value={item.unitPrice} onChange={(event) => updateLineItem(index, "unitPrice", event.target.value)} disabled={!assessmentPassed} />
                  <strong>{formatMoney(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</strong>
                  <button type="button" aria-label="Remove item" disabled={!assessmentPassed} onClick={() => setLineItems((items) => items.filter((_, itemIndex) => itemIndex !== index))}><FiTrash2 /></button>
                </div>
              ))}
            </div>

            <div className="quotation-bottom-grid">
              <div className="quotation-terms">
                <label><span>Validity date</span><input type="date" value={quoteMeta.validUntil} onChange={(event) => setQuoteMeta((current) => ({ ...current, validUntil: event.target.value }))} disabled={!assessmentPassed} /></label>
                <label><span>Terms</span><textarea rows="4" value={quoteMeta.terms} onChange={(event) => setQuoteMeta((current) => ({ ...current, terms: event.target.value }))} disabled={!assessmentPassed} /></label>
                <label><span>Internal / customer notes</span><textarea rows="3" value={quoteMeta.notes} onChange={(event) => setQuoteMeta((current) => ({ ...current, notes: event.target.value }))} disabled={!assessmentPassed} /></label>
              </div>
              <div className="quotation-total-card">
                <label><span>Discount</span><input type="number" min="0" value={quoteMeta.discount} onChange={(event) => setQuoteMeta((current) => ({ ...current, discount: event.target.value }))} disabled={!assessmentPassed} /></label>
                <label><span>Tax</span><input type="number" min="0" value={quoteMeta.tax} onChange={(event) => setQuoteMeta((current) => ({ ...current, tax: event.target.value }))} disabled={!assessmentPassed} /></label>
                <label><span>Customer equity %</span><input type="number" value="20" readOnly /></label>
                <div><span>Subtotal</span><strong>{formatMoney(totals.subtotal)}</strong></div>
                <div className="grand-total"><span>Total project cost</span><strong>{formatMoney(totals.total)}</strong></div>
                <div><span>Customer equity</span><strong>{formatMoney(totals.equityAmount)}</strong></div>
                <div><span>Bank finance request</span><strong>{formatMoney(totals.bankFinanceAmount)}</strong></div>
              </div>
            </div>

            <div className="case-workspace-actions">
              {latestQuotation && <button type="button" className="ops-button secondary" onClick={() => downloadProjectDocument(latestQuotation)}><FiDownload /> Download {latestQuotation.reference}</button>}
              <button type="button" className="ops-button secondary" disabled={!assessmentPassed || saving} onClick={generateQuotation}><FiFileText /> Generate quotation draft</button>
              <button type="button" className="ops-button primary" disabled={!latestQuotation || latestQuotation.status !== "draft" || saving} onClick={sendQuotation}><FiSend /> Email quotation to customer</button>
            </div>
          </article>
        </section>
      )}

      {activeTab === "documents" && (
        <section className="case-document-grid">
          {documents.length === 0 ? <div className="ops-card case-document-empty">No quotations or invoices have been generated.</div> : documents.map((document) => (
            <article className="ops-card case-document-card" key={document._id}>
              <div><span>{document.type}</span><h2>{document.reference}</h2><p>{document.title}</p></div>
              <i className={`status-pill ${document.status === "approved" || document.status === "issued" ? "success" : document.status === "sent" ? "violet" : "neutral"}`}>{document.status}</i>
              <dl><div><dt>Total</dt><dd>{formatMoney(document.total)}</dd></div><div><dt>Version</dt><dd>V{document.version}</dd></div><div><dt>Customer decision</dt><dd>{document.customerDecision?.status || "Not required"}</dd></div><div><dt>Email delivery</dt><dd>{document.emailDelivery?.status || "Not sent"}</dd></div></dl>
              <div className="case-document-actions">
                <button type="button" className="ops-button secondary" onClick={() => downloadProjectDocument(document)}><FiDownload /> Download PDF</button>
                {document.type === "invoice" && <button type="button" className="ops-button primary" disabled={saving} onClick={() => sendInvoice(document)}><FiSend /> {document.emailDelivery?.status === "sent" ? "Resend invoice" : "Email invoice"}</button>}
              </div>
            </article>
          ))}
        </section>
      )}
    </AdminLayout>
  );
}

export default AdminFinancingCase;
