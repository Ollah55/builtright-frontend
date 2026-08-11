import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiMapPin,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import {
  demoFinancingRequests,
  FINANCING_STAGES,
  formatMoney,
  getFinancingStage,
  getNextFinancingStage,
  getStageIndex,
  isAssessmentPricingUnlocked,
  isInstallationCostLabel,
  normalizeFinancingStatus,
  statusTone,
} from "../../lib/operations";
import { isDevelopmentPreview } from "../../lib/previewMode";
import "./adminloanrequests.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://builtright-backend.onrender.com";

const filterGroups = [
  { id: "all", label: "All cases" },
  { id: "intake", label: "Intake" },
  { id: "inspection", label: "Inspection" },
  { id: "assessment", label: "Assessment" },
  { id: "quotation", label: "Quotation" },
  { id: "bank", label: "Bank review" },
  { id: "decision", label: "Decision and deposit" },
  { id: "disbursement", label: "Disbursement" },
  { id: "fulfillment", label: "Fulfilment" },
];

function normalizeRequest(request) {
  const firstItem = request.items?.[0];
  const id = request._id || request.id;
  const installationPricingUnlocked = isAssessmentPricingUnlocked(request);
  const rawUpfrontCosts = request.upfrontCosts?.length
    ? request.upfrontCosts
    : [
        { label: "Solar system", amount: request.estimatedAmount, confirmed: Boolean(request.estimatedAmount) },
        { label: "Standard installation service", amount: null, confirmed: false },
        { label: "Insurance and compliance (above 5kVA)", amount: null, confirmed: false },
        { label: "IoT tracking", amount: null, confirmed: false },
        { label: "Maintenance", amount: null, confirmed: false },
      ];
  const rawInspectionCosts = request.inspectionCosts?.length
    ? request.inspectionCosts
    : [
        { label: "Installation kit and materials", amount: null },
        { label: "Panel mounting materials", amount: null },
        { label: "Cable, DB and protection accessories", amount: null },
        { label: "Extra civil or electrical work", amount: null },
      ];
  return {
    ...request,
    _id: id,
    reference: request.reference || `BRF-${String(id || "NEW").slice(-5).toUpperCase()}`,
    status: normalizeFinancingStatus(request.status),
    systemName: request.systemName || firstItem?.name || "Selected solar system",
    systemCapacity: request.systemCapacity || firstItem?.capacity || "Sizing to be confirmed",
    nextAction: request.nextAction || getNextFinancingStage(request.status)?.label || "Review case",
    updatedAt: request.updatedAt || request.createdAt,
    customer: {
      ...request.customer,
      location: request.customer?.location || "Location not recorded",
    },
    installationPricingUnlocked,
    upfrontCosts: rawUpfrontCosts.map((item) => isInstallationCostLabel(item.label) && !installationPricingUnlocked
      ? { ...item, amount: null, confirmed: false }
      : item),
    inspectionCosts: rawInspectionCosts.map((item) => installationPricingUnlocked ? item : { ...item, amount: null }),
  };
}

function FinancingTimeline({ status }) {
  const currentIndex = getStageIndex(status);
  const visibleStages = [
    "submitted",
    "internal-review",
    "inspection-scheduled",
    "inspection-completed",
    "load-audit-completed",
    "due-diligence-passed",
    "quotation-draft",
    "quotation-sent",
    "quotation-approved",
    "sent-to-bank",
    "credit-review",
    "approved",
    "deposit-paid",
    "disbursed",
    "order-created",
    "installation-scheduled",
    "completed",
  ];

  return (
    <div className="finance-timeline">
      {visibleStages.map((stageId) => {
        const stage = FINANCING_STAGES.find((item) => item.id === stageId);
        const index = FINANCING_STAGES.findIndex((item) => item.id === stageId);
        const complete = currentIndex >= index && status !== "rejected";
        const current = normalizeFinancingStatus(status) === stageId;
        return (
          <div className={`finance-timeline-step ${complete ? "complete" : ""} ${current ? "current" : ""}`} key={stageId}>
            <span>{complete ? <FiCheck /> : ""}</span>
            <p>{stage?.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function AdminLoanRequests() {
  const navigate = useNavigate();
  const [loanRequests, setLoanRequests] = useState(demoFinancingRequests);
  const [loading, setLoading] = useState(true);
  const [usingPreviewData, setUsingPreviewData] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLoanRequests = async () => {
      const isLocalPreview = isDevelopmentPreview();

      if (isLocalPreview) {
        setLoading(false);
        setUsingPreviewData(true);
        return;
      }

      const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
      try {
        const response = await fetch(`${API_BASE_URL}/api/loan-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Could not load financing cases.");
        if (Array.isArray(data.loanRequests) && data.loanRequests.length > 0) {
          setLoanRequests(data.loanRequests.map(normalizeRequest));
          setUsingPreviewData(false);
        }
      } catch (error) {
        console.info("Using financing preview data:", error.message);
        setUsingPreviewData(true);
      } finally {
        setLoading(false);
      }
    };
    loadLoanRequests();
  }, []);

  const normalizedRequests = useMemo(() => loanRequests.map(normalizeRequest), [loanRequests]);
  const selectedRequest = normalizedRequests.find((request) => request._id === selectedId) || null;

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return normalizedRequests.filter((request) => {
      const stage = getFinancingStage(request.status);
      const matchesGroup =
        statusFilter === "all" ||
        stage.group === statusFilter ||
        (statusFilter === "decision" && request.status === "rejected");
      const matchesSearch =
        !search ||
        [
          request.reference,
          request.customer?.fullName,
          request.customer?.email,
          request.customer?.phone,
          request.customer?.location,
          request.systemName,
        ].some((value) => String(value || "").toLowerCase().includes(search));
      return matchesGroup && matchesSearch;
    });
  }, [normalizedRequests, searchTerm, statusFilter]);

  const updateCaseStatus = async (request, nextStatus) => {
    setSaving(true);
    setMessage("");
    try {
      if (!request.isDemo && !usingPreviewData) {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/loan-requests/${request._id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Status update failed.");
        setLoanRequests((items) => items.map((item) => (item._id === request._id ? normalizeRequest(data.loanRequest) : item)));
        setMessage("Financing stage updated and added to the case history.");
      } else {
        setLoanRequests((items) => items.map((item) => (item._id === request._id ? { ...item, status: nextStatus, nextAction: getNextFinancingStage(nextStatus)?.label || "Review case" } : item)));
        setMessage("Preview stage updated. It will persist after the operations API is connected.");
      }
    } catch (error) {
      setMessage(error.message || "The stage could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const nextStage = selectedRequest ? getNextFinancingStage(selectedRequest.status) : null;
  const selectedStageGroup = selectedRequest ? getFinancingStage(selectedRequest.status).group : null;
  const canManuallyAdvance = Boolean(
    selectedRequest && nextStage && (
      ["bank", "decision", "disbursement", "fulfillment"].includes(selectedStageGroup) ||
      (selectedRequest.status === "quotation-approved" && selectedRequest.bankApplication?.redirectUrl)
    )
  );

  return (
    <AdminLayout
      title="Financing cases"
      subtitle="Move each request through BuiltRight review, site inspection, final quotation, bank decision, deposit, and verified disbursement."
      actions={<button className="ops-button secondary" type="button"><FiFileText /> Export case register</button>}
    >
      {usingPreviewData && (
        <div className="finance-preview-banner">
          <span />
          <p><strong>Interface preview:</strong> representative cases are shown while the live operations schema is being prepared.</p>
        </div>
      )}

      {message && <div className="finance-message" role="status">{message}</div>}

      <section className="finance-toolbar">
        <div className="finance-search"><FiSearch /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search reference, customer, location or system" /></div>
        <div className="finance-filter-tabs">
          {filterGroups.map((group) => (
            <button type="button" className={statusFilter === group.id ? "active" : ""} key={group.id} onClick={() => setStatusFilter(group.id)}>{group.label}</button>
          ))}
        </div>
      </section>

      <section className="finance-register ops-card">
        <div className="finance-register-head">
          <div><p className="ops-section-kicker">Case register</p><h2>{loading ? "Loading cases" : `${filteredRequests.length} financing cases`}</h2></div>
          <span>Last synced just now</span>
        </div>

        <div className="finance-table-wrap">
          <div className="finance-table">
            <div className="finance-table-row finance-table-header">
              <span>Reference and customer</span><span>System</span><span>Project value</span><span>Current stage</span><span>Next action</span><span />
            </div>
            {filteredRequests.map((request) => {
              const stage = getFinancingStage(request.status);
              return (
                <button type="button" className="finance-table-row" key={request._id} onClick={() => setSelectedId(request._id)}>
                  <span className="finance-customer-cell"><strong>{request.reference}</strong><p>{request.customer?.fullName}</p><small>{request.customer?.location}</small></span>
                  <span><strong>{request.systemCapacity}</strong><small>{request.systemName}</small></span>
                  <span><strong>{formatMoney(request.finalProjectCost || request.estimatedAmount)}</strong><small>{request.finalProjectCost ? "Final quotation" : "Selected system price only"}</small></span>
                  <span><i className={`status-pill ${statusTone(request.status)}`}>{stage.label}</i></span>
                  <span><strong>{request.nextAction}</strong><small>{request.updatedAt ? new Date(request.updatedAt).toLocaleDateString("en-GB") : "Not updated"}</small></span>
                  <span><FiChevronRight /></span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedRequest && (
        <div className="finance-drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <aside className="finance-drawer" role="dialog" aria-modal="true" aria-label={`Financing case ${selectedRequest.reference}`}>
            <div className="finance-drawer-head">
              <div><p>{selectedRequest.reference}</p><h2>{selectedRequest.customer.fullName}</h2><span className={`status-pill ${statusTone(selectedRequest.status)}`}>{getFinancingStage(selectedRequest.status).label}</span></div>
              <button type="button" onClick={() => setSelectedId(null)} aria-label="Close case"><FiX /></button>
            </div>

            <div className="finance-drawer-scroll">
              <section className="finance-summary-grid">
                <div><FiUser /><span>Customer</span><strong>{selectedRequest.customer.fullName}</strong><small>{selectedRequest.customer.phone}</small></div>
                <div><FiMapPin /><span>Project site</span><strong>{selectedRequest.customer.location}</strong><small>{selectedRequest.inspection?.property || "Property details pending"}</small></div>
                <div><FiCreditCard /><span>Solar system</span><strong>{selectedRequest.systemCapacity}</strong><small>{selectedRequest.systemName}</small></div>
                <div><FiClock /><span>Next action</span><strong>{selectedRequest.nextAction}</strong><small>Case owner: Operations</small></div>
              </section>

              <section className="drawer-section">
                <div className="drawer-section-head"><div><p>Case progress</p><h3>Financing lifecycle</h3></div></div>
                <FinancingTimeline status={selectedRequest.status} />
              </section>

              <section className="drawer-section">
                <div className="drawer-section-head"><div><p>Request-stage pricing</p><h3>Known costs before assessment</h3></div><strong>{formatMoney(selectedRequest.upfrontCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</strong></div>
                <div className="cost-list">
                  {selectedRequest.upfrontCosts.map((item) => <div key={item.label}><span>{item.label}</span><strong>{isInstallationCostLabel(item.label) && !selectedRequest.installationPricingUnlocked ? "Locked" : formatMoney(item.amount)}</strong></div>)}
                </div>
              </section>

              <section className="drawer-section estimate-section">
                <div className="drawer-section-head"><div><p>After full assessment</p><h3>Installation and materials</h3></div><strong>{selectedRequest.installationPricingUnlocked && selectedRequest.inspectionCosts.some((item) => item.amount) ? formatMoney(selectedRequest.inspectionCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0)) : "Locked"}</strong></div>
                <div className="cost-list">
                  {selectedRequest.inspectionCosts.map((item) => <div key={item.label}><span>{item.label}</span><strong>{selectedRequest.installationPricingUnlocked ? formatMoney(item.amount) : "Locked"}</strong></div>)}
                </div>
                <p className="estimate-note">Installation labour and material prices unlock only after the site inspection, load audit, and due-diligence checks all pass.</p>
              </section>

              <section className="finance-two-column">
                <div className="drawer-section compact-section">
                  <div className="drawer-section-head"><div><p>Site inspection</p><h3>{selectedRequest.inspection?.status || "Not scheduled"}</h3></div><FiCalendar /></div>
                  <span>{selectedRequest.inspection?.date || "Date pending"}</span>
                  <small>{selectedRequest.inspection?.assignee || "Technician not assigned"}</small>
                </div>
                <div className="drawer-section compact-section">
                  <div className="drawer-section-head"><div><p>Bank handoff</p><h3>{selectedRequest.bankApplication?.status || "Not started"}</h3></div><FiCreditCard /></div>
                  <span>{selectedRequest.bankApplication?.provider || "Provider pending"}</span>
                  <small>Reference: {selectedRequest.bankApplication?.externalReference || "Pending"}</small>
                </div>
              </section>
            </div>

            <footer className="finance-drawer-actions">
              <button type="button" className="ops-button secondary" onClick={() => navigate(`/admin/loan-requests/${selectedRequest._id}`)}>
                Open assessment &amp; quotation
              </button>
              {canManuallyAdvance && selectedRequest.status !== "rejected" && (
                <button type="button" className="ops-button primary" disabled={saving} onClick={() => updateCaseStatus(selectedRequest, nextStage.id)}>{saving ? "Updating..." : `Move to ${nextStage.label}`} <FiArrowRight /></button>
              )}
            </footer>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLoanRequests;
