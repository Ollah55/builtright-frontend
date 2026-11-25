import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiHome,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiTool,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import useLiveRefresh from "../../hooks/useLiveRefresh";
import "./adminMaintenance.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const titleCase = (value = "") => String(value).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value, fallback = "Not set") => value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : fallback;
const dateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";

const emptyPropertyForm = {
  customerId: "", propertyName: "", propertyType: "residential-building", address: "", city: "Lagos", state: "Lagos",
  landmark: "", plan: "bronze", subscriptionStatus: "pending", billingCycle: "monthly", amount: "", startsAt: "", endsAt: "", nextRenewalAt: "",
};

function AdminMaintenance() {
  const token = localStorage.getItem("adminToken");
  const [data, setData] = useState({ stats: {}, properties: [], requests: [] });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState("");
  const [propertyForm, setPropertyForm] = useState(emptyPropertyForm);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [requestForm, setRequestForm] = useState({ status: "acknowledged", assignedTeam: "", responseNote: "" });
  const [visitForm, setVisitForm] = useState({ type: "preventive", scheduledFor: "", technician: "BuiltRight maintenance team", summary: "Scheduled maintenance visit" });

  const loadDesk = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [deskResponse, customerResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/maintenance/overview`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/customers`, { headers }),
      ]);
      const [deskData, customerData] = await Promise.all([deskResponse.json(), customerResponse.json()]);
      if (!deskResponse.ok || !deskData.status) throw new Error(deskData.message || "Could not load maintenance operations.");
      setData(deskData);
      if (customerData.status) setCustomers((customerData.customers || []).filter((item) => item.isActive !== false));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDesk(); }, [token]);
  useLiveRefresh(loadDesk, { enabled: !saving && !dialog });

  const selectedProperty = data.properties.find((item) => item._id === selectedPropertyId) || null;
  const selectedRequest = data.requests.find((item) => item._id === selectedRequestId) || null;
  const emergencyRequests = data.requests.filter((item) => item.requestType === "emergency" && !["resolved", "closed", "cancelled"].includes(item.status));
  const filteredProperties = useMemo(() => {
    const term = search.toLowerCase();
    return data.properties.filter((item) => {
      const filterMatch = filter === "all" || (filter === "attention" ? ["attention", "critical"].includes(item.health?.status) : item.subscription?.status === filter);
      const searchMatch = !term || [item.property?.name, item.property?.address, item.reference, item.customer?.fullName, item.customer?.email].some((value) => String(value || "").toLowerCase().includes(term));
      return filterMatch && searchMatch;
    });
  }, [data.properties, filter, search]);

  const createProperty = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/maintenance/properties`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(propertyForm) });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Could not add the property.");
      setMessage(result.message); setPropertyForm(emptyPropertyForm); setDialog(""); await loadDesk();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const openProperty = (property) => {
    setSelectedPropertyId(property._id);
    setPropertyForm({
      propertyName: property.property?.name || "", propertyType: property.property?.type || "other", address: property.property?.address || "",
      plan: property.subscription?.plan || "bronze", subscriptionStatus: property.subscription?.status || "pending", billingCycle: property.subscription?.billingCycle || "monthly",
      amount: property.subscription?.amount || "", startsAt: dateInput(property.subscription?.startsAt), endsAt: dateInput(property.subscription?.endsAt), nextRenewalAt: dateInput(property.subscription?.nextRenewalAt),
      healthStatus: property.health?.status || "assessment-pending", healthScore: property.health?.score || 0, healthSummary: property.health?.summary || "", lastAssessmentAt: dateInput(property.health?.lastAssessmentAt),
      coveredServices: (property.subscription?.coveredServices || []).join("\n"), subscriptionNotes: property.subscription?.notes || "",
      onboardingStage: property.onboarding?.stage || "site-inspection-pending",
      inspectionScheduledAt: dateInput(property.onboarding?.inspection?.scheduledAt), inspectionCompletedAt: dateInput(property.onboarding?.inspection?.completedAt), inspectionFindings: property.onboarding?.inspection?.findings || "", dueDiligenceNotes: property.onboarding?.inspection?.dueDiligenceNotes || "",
      remediationRequired: Boolean(property.onboarding?.remediation?.required), remediationStatus: property.onboarding?.remediation?.status || "not-assessed", remediationScope: property.onboarding?.remediation?.scope || "", remediationCompletedAt: dateInput(property.onboarding?.remediation?.completedAt),
      probationPaymentStatus: property.onboarding?.probation?.paymentStatus || "pending", probationAmount: property.onboarding?.probation?.amount || "", probationPaidAt: dateInput(property.onboarding?.probation?.paidAt), probationStartsAt: dateInput(property.onboarding?.probation?.startsAt), probationOutcome: property.onboarding?.probation?.outcome || "pending", probationReviewNotes: property.onboarding?.probation?.reviewNotes || "",
    });
    setDialog("property");
  };

  const saveProperty = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const payload = { ...propertyForm, coveredServices: String(propertyForm.coveredServices || "").split("\n").map((item) => item.trim()).filter(Boolean) };
      const response = await fetch(`${API_BASE_URL}/api/admin/maintenance/properties/${selectedPropertyId}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Could not update the property.");
      setMessage(result.message); setDialog(""); await loadDesk();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const scheduleVisit = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/maintenance/properties/${selectedPropertyId}/visits`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(visitForm) });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Could not schedule the visit.");
      setMessage(result.message); setVisitForm({ type: "preventive", scheduledFor: "", technician: "BuiltRight maintenance team", summary: "Scheduled maintenance visit" }); setDialog(""); await loadDesk();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const openRequest = (request) => {
    setSelectedRequestId(request._id);
    setRequestForm({ status: request.status === "submitted" ? "acknowledged" : request.status, assignedTeam: request.assignedTeam || "", responseNote: request.responseNote || "" });
    setDialog("request");
  };

  const updateRequest = async (event) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/maintenance/requests/${selectedRequestId}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(requestForm) });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Could not update the response.");
      setMessage(result.message); setDialog(""); await loadDesk();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  const deleteProperty = async (property) => {
    if (!window.confirm(`Delete ${property.property.name} and all of its maintenance requests?`)) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/maintenance/properties/${property._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || "Could not delete the property.");
      setMessage(result.message); await loadDesk();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Facility maintenance" subtitle="Monitor buildings, subscriptions, planned care, service requests, and emergency response." actions={<button type="button" className="maintenance-admin-primary" onClick={() => { setPropertyForm(emptyPropertyForm); setDialog("new"); }}><FiPlus /> Add property</button>}>
      {message && <p className="maintenance-admin-message" role="status">{message}</p>}

      {emergencyRequests.length > 0 && <section className="maintenance-admin-emergencies"><header><FiAlertTriangle /><div><span>Immediate attention</span><h2>{emergencyRequests.length} active emergency {emergencyRequests.length === 1 ? "alert" : "alerts"}</h2></div></header><div>{emergencyRequests.map((request) => <button type="button" key={request._id} onClick={() => openRequest(request)}><strong>{request.reference}</strong><span>{request.customerSnapshot?.fullName} · {titleCase(request.category)}</span><small>{request.description}</small><i>{titleCase(request.status)}</i></button>)}</div></section>}

      <section className="maintenance-admin-stats">
        <article><span><FiHome /></span><div><small>Managed properties</small><strong>{data.stats?.totalProperties || 0}</strong></div></article>
        <article><span><FiShield /></span><div><small>Probation / active</small><strong>{data.stats?.activeSubscriptions || 0}</strong></div></article>
        <article><span><FiActivity /></span><div><small>Attention required</small><strong>{data.stats?.attentionRequired || 0}</strong></div></article>
        <article><span><FiTool /></span><div><small>Open requests</small><strong>{data.stats?.openRequests || 0}</strong></div></article>
        <article className="emergency"><span><FiAlertTriangle /></span><div><small>Emergency alerts</small><strong>{data.stats?.emergencyAlerts || 0}</strong></div></article>
      </section>

      <section className="maintenance-admin-toolbar">
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search property, customer, address or reference" />
        <div>{["all", "active", "pending", "attention"].map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{titleCase(item)}</button>)}</div>
        <button type="button" className="refresh" onClick={loadDesk}><FiRefreshCw /> Refresh</button>
      </section>

      <div className="maintenance-admin-layout">
        <section className="maintenance-admin-panel">
          <header><div><p>Facility portfolio</p><h2>{filteredProperties.length} properties</h2></div></header>
          {loading ? <p className="maintenance-admin-empty">Loading facilities...</p> : filteredProperties.length === 0 ? <p className="maintenance-admin-empty">No maintenance properties found.</p> : <div className="maintenance-admin-property-list">{filteredProperties.map((property) => {
            const openCount = data.requests.filter((request) => String(request.property?._id || request.property) === String(property._id) && !["resolved", "closed", "cancelled"].includes(request.status)).length;
            return <article key={property._id}><div className="property-main"><span className={`property-health ${property.health?.status}`}><FiHome /></span><div><small>{property.reference}</small><h3>{property.property?.name}</h3><p>{property.property?.address}</p><em>{property.customer?.fullName || property.customerSnapshot?.fullName}</em></div></div><dl><div><dt>Plan</dt><dd>{titleCase(property.subscription?.plan)}</dd></div><div><dt>Status</dt><dd className={property.subscription?.status}>{titleCase(property.subscription?.status)}</dd></div><div><dt>Health</dt><dd>{property.health?.score || 0}% · {titleCase(property.health?.status)}</dd></div><div><dt>Open jobs</dt><dd>{openCount}</dd></div></dl><footer><button type="button" onClick={() => openProperty(property)}>Manage property</button><button type="button" onClick={() => { setSelectedPropertyId(property._id); setDialog("visit"); }}><FiCalendar /> Schedule visit</button><button type="button" className="delete" onClick={() => deleteProperty(property)} aria-label={`Delete ${property.property?.name}`}><FiTrash2 /></button></footer></article>;
          })}</div>}
        </section>

        <section className="maintenance-admin-panel maintenance-admin-requests">
          <header><div><p>Response queue</p><h2>Latest service activity</h2></div><span>{data.stats?.openRequests || 0} open</span></header>
          <div>{data.requests.length === 0 ? <p className="maintenance-admin-empty">No customer requests yet.</p> : data.requests.slice(0, 18).map((request) => <button type="button" className={request.requestType === "emergency" ? "emergency" : ""} key={request._id} onClick={() => openRequest(request)}><span className="request-kind">{request.requestType === "emergency" ? <FiAlertTriangle /> : <FiTool />}</span><div><small>{request.reference} · {request.property?.property?.name || "Property"}</small><strong>{request.title}</strong><p>{request.customerSnapshot?.fullName} · {formatDate(request.createdAt)}</p></div><i className={request.status}>{titleCase(request.status)}</i></button>)}</div>
        </section>
      </div>

      {dialog && <div className="maintenance-admin-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDialog(""); }}>
        <section className="maintenance-admin-modal" role="dialog" aria-modal="true">
          <button type="button" className="close" onClick={() => setDialog("")}><FiX /></button>
          {dialog === "new" && <form onSubmit={createProperty}><div className="modal-title"><FiHome /><div><p>New maintenance account</p><h2>Add a customer property</h2></div></div><div className="maintenance-admin-form">
            <label className="wide"><span>Customer account</span><select required value={propertyForm.customerId} onChange={(event) => setPropertyForm({ ...propertyForm, customerId: event.target.value })}><option value="">Select customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName} · {customer.email}</option>)}</select></label>
            <label><span>Property name</span><input required value={propertyForm.propertyName} onChange={(event) => setPropertyForm({ ...propertyForm, propertyName: event.target.value })} placeholder="Example: Joy Alimi Residence" /></label>
            <label><span>Property type</span><select value={propertyForm.propertyType} onChange={(event) => setPropertyForm({ ...propertyForm, propertyType: event.target.value })}>{["apartment","residential-building","office","school","hotel","retail","industrial","estate","other"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label>
            <label className="wide"><span>Property address</span><input required value={propertyForm.address} onChange={(event) => setPropertyForm({ ...propertyForm, address: event.target.value })} /></label>
            <label><span>City</span><input value={propertyForm.city} onChange={(event) => setPropertyForm({ ...propertyForm, city: event.target.value })} /></label><label><span>State</span><input value={propertyForm.state} onChange={(event) => setPropertyForm({ ...propertyForm, state: event.target.value })} /></label>
            <label><span>Subscription plan</span><select value={propertyForm.plan} onChange={(event) => setPropertyForm({ ...propertyForm, plan: event.target.value })}>{["bronze","silver","gold","platinum","custom"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label>
            <label><span>Onboarding status</span><input value="Site inspection pending" disabled /></label>
            <label><span>Billing cycle</span><select value={propertyForm.billingCycle} onChange={(event) => setPropertyForm({ ...propertyForm, billingCycle: event.target.value })}>{["monthly","quarterly","biannual","annual","custom"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label>
            <label><span>Plan amount (₦)</span><input type="number" min="0" value={propertyForm.amount} onChange={(event) => setPropertyForm({ ...propertyForm, amount: event.target.value })} /></label>
            <label><span>Start date</span><input type="date" value={propertyForm.startsAt} onChange={(event) => setPropertyForm({ ...propertyForm, startsAt: event.target.value })} /></label><label><span>Next renewal</span><input type="date" value={propertyForm.nextRenewalAt} onChange={(event) => setPropertyForm({ ...propertyForm, nextRenewalAt: event.target.value })} /></label>
          </div><footer><button type="button" onClick={() => setDialog("")}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Adding..." : "Add property & notify customer"}</button></footer></form>}

          {dialog === "property" && selectedProperty && <form onSubmit={saveProperty}><div className="modal-title"><FiActivity /><div><p>{selectedProperty.reference}</p><h2>Manage property & subscription</h2><span>{selectedProperty.customer?.fullName}</span></div></div><div className="maintenance-admin-form">
            <label><span>Property name</span><input required value={propertyForm.propertyName} onChange={(event) => setPropertyForm({ ...propertyForm, propertyName: event.target.value })} /></label><label><span>Address</span><input required value={propertyForm.address} onChange={(event) => setPropertyForm({ ...propertyForm, address: event.target.value })} /></label>
            <label><span>Plan</span><select value={propertyForm.plan} onChange={(event) => setPropertyForm({ ...propertyForm, plan: event.target.value })}>{["bronze","silver","gold","platinum","custom"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><label><span>Onboarding / contract stage</span><select value={propertyForm.onboardingStage} onChange={(event) => setPropertyForm({ ...propertyForm, onboardingStage: event.target.value })}>{["site-inspection-pending","site-inspection-scheduled","due-diligence-in-progress","remediation-required","remediation-in-progress","remediation-completed","probation-payment-due","probation-active","probation-review","contract-active","terminated"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label>
            <label><span>Billing cycle</span><select value={propertyForm.billingCycle} onChange={(event) => setPropertyForm({ ...propertyForm, billingCycle: event.target.value })}>{["monthly","quarterly","biannual","annual","custom"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><label><span>Amount (₦)</span><input type="number" min="0" value={propertyForm.amount} onChange={(event) => setPropertyForm({ ...propertyForm, amount: event.target.value })} /></label>
            <label><span>Start date</span><input type="date" value={propertyForm.startsAt} onChange={(event) => setPropertyForm({ ...propertyForm, startsAt: event.target.value })} /></label><label><span>Next renewal</span><input type="date" value={propertyForm.nextRenewalAt} onChange={(event) => setPropertyForm({ ...propertyForm, nextRenewalAt: event.target.value })} /></label>
            <label><span>Facility health</span><select value={propertyForm.healthStatus} onChange={(event) => setPropertyForm({ ...propertyForm, healthStatus: event.target.value })}>{["assessment-pending","healthy","attention","critical"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><label><span>Health score (%)</span><input type="number" min="0" max="100" value={propertyForm.healthScore} onChange={(event) => setPropertyForm({ ...propertyForm, healthScore: event.target.value })} /></label>
            <label className="wide"><span>Customer-facing health summary</span><textarea rows="3" value={propertyForm.healthSummary} onChange={(event) => setPropertyForm({ ...propertyForm, healthSummary: event.target.value })} /></label>
            <div className="maintenance-admin-section-title wide"><strong>Site inspection & due diligence</strong><span>The property cannot enter probation before this stage is completed.</span></div>
            <label><span>Inspection scheduled date</span><input type="date" value={propertyForm.inspectionScheduledAt} onChange={(event) => setPropertyForm({ ...propertyForm, inspectionScheduledAt: event.target.value })} /></label><label><span>Inspection completed date</span><input type="date" value={propertyForm.inspectionCompletedAt} onChange={(event) => setPropertyForm({ ...propertyForm, inspectionCompletedAt: event.target.value })} /></label>
            <label className="wide"><span>Inspection findings</span><textarea rows="3" value={propertyForm.inspectionFindings} onChange={(event) => setPropertyForm({ ...propertyForm, inspectionFindings: event.target.value })} placeholder="Record the present condition and defects found." /></label>
            <label className="wide"><span>Due-diligence conclusion</span><textarea rows="3" value={propertyForm.dueDiligenceNotes} onChange={(event) => setPropertyForm({ ...propertyForm, dueDiligenceNotes: event.target.value })} placeholder="Record risks, exclusions, access requirements, and recommendations." /></label>
            <div className="maintenance-admin-section-title wide"><strong>Remediation clearance</strong><span>Required corrective work must be completed before probation begins.</span></div>
            <label className="maintenance-admin-check"><input type="checkbox" checked={propertyForm.remediationRequired} onChange={(event) => setPropertyForm({ ...propertyForm, remediationRequired: event.target.checked, remediationStatus: event.target.checked ? "required" : "not-required" })} /><span>Remediation is required</span></label><label><span>Remediation status</span><select value={propertyForm.remediationStatus} onChange={(event) => setPropertyForm({ ...propertyForm, remediationStatus: event.target.value })}>{["not-assessed","not-required","required","in-progress","completed"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label>
            <label className="wide"><span>Remediation scope</span><textarea rows="3" value={propertyForm.remediationScope} onChange={(event) => setPropertyForm({ ...propertyForm, remediationScope: event.target.value })} placeholder="List work the customer must complete before BuiltRight assumes the maintenance contract." /></label><label><span>Remediation completed date</span><input type="date" value={propertyForm.remediationCompletedAt} onChange={(event) => setPropertyForm({ ...propertyForm, remediationCompletedAt: event.target.value })} /></label>
            <div className="maintenance-admin-section-title wide"><strong>Three-month probation</strong><span>Payment is collected in full and is non-refundable after remediation clearance.</span></div>
            <label><span>Probation payment</span><select value={propertyForm.probationPaymentStatus} onChange={(event) => setPropertyForm({ ...propertyForm, probationPaymentStatus: event.target.value })}><option value="pending">Pending</option><option value="paid">Paid in full</option></select></label><label><span>Three-month amount (₦)</span><input type="number" min="0" value={propertyForm.probationAmount} onChange={(event) => setPropertyForm({ ...propertyForm, probationAmount: event.target.value })} /></label>
            <label><span>Payment confirmed date</span><input type="date" value={propertyForm.probationPaidAt} onChange={(event) => setPropertyForm({ ...propertyForm, probationPaidAt: event.target.value })} /></label><label><span>Probation start date</span><input type="date" value={propertyForm.probationStartsAt} onChange={(event) => setPropertyForm({ ...propertyForm, probationStartsAt: event.target.value })} /></label>
            <label><span>Outcome after three months</span><select value={propertyForm.probationOutcome} onChange={(event) => setPropertyForm({ ...propertyForm, probationOutcome: event.target.value })}><option value="pending">Pending review</option><option value="continue">Continue contract</option><option value="terminate">Terminate contract</option></select></label><label><span>Calculated probation end</span><input value={selectedProperty.onboarding?.probation?.endsAt ? formatDate(selectedProperty.onboarding.probation.endsAt) : "Calculated from start date"} disabled /></label>
            <label className="wide"><span>Probation review notes</span><textarea rows="3" value={propertyForm.probationReviewNotes} onChange={(event) => setPropertyForm({ ...propertyForm, probationReviewNotes: event.target.value })} /></label>
            <label className="wide"><span>Covered services (one per line)</span><textarea rows="5" value={propertyForm.coveredServices} onChange={(event) => setPropertyForm({ ...propertyForm, coveredServices: event.target.value })} /></label>
          </div><footer><button type="button" onClick={() => setDialog("")}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></footer></form>}

          {dialog === "visit" && <form onSubmit={scheduleVisit}><div className="modal-title"><FiCalendar /><div><p>Planned maintenance</p><h2>Schedule a facility visit</h2><span>{data.properties.find((item) => item._id === selectedPropertyId)?.property?.name}</span></div></div><div className="maintenance-admin-form">
            <label><span>Visit type</span><select value={visitForm.type} onChange={(event) => setVisitForm({ ...visitForm, type: event.target.value })}>{["inspection","preventive","corrective","emergency","other"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><label><span>Date and time</span><input required type="datetime-local" value={visitForm.scheduledFor} onChange={(event) => setVisitForm({ ...visitForm, scheduledFor: event.target.value })} /></label>
            <label className="wide"><span>Assigned technician/team</span><input required value={visitForm.technician} onChange={(event) => setVisitForm({ ...visitForm, technician: event.target.value })} /></label><label className="wide"><span>Visit purpose</span><textarea rows="3" value={visitForm.summary} onChange={(event) => setVisitForm({ ...visitForm, summary: event.target.value })} /></label>
          </div><footer><button type="button" onClick={() => setDialog("")}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Scheduling..." : "Schedule & notify customer"}</button></footer></form>}

          {dialog === "request" && selectedRequest && <form onSubmit={updateRequest}><div className={`modal-title ${selectedRequest.requestType === "emergency" ? "emergency" : ""}`}><FiAlertTriangle /><div><p>{selectedRequest.reference}</p><h2>{selectedRequest.title}</h2><span>{selectedRequest.customerSnapshot?.fullName} · {selectedRequest.property?.property?.name}</span></div></div><div className="maintenance-request-detail"><p>{selectedRequest.description}</p><dl><div><dt>Category</dt><dd>{titleCase(selectedRequest.category)}</dd></div><div><dt>Location</dt><dd>{selectedRequest.locationWithinProperty || "Not stated"}</dd></div><div><dt>Received</dt><dd>{formatDate(selectedRequest.createdAt)}</dd></div><div><dt>Safe on site</dt><dd>{selectedRequest.safeToRemainOnSite ? "Yes" : "No"}</dd></div></dl></div><div className="maintenance-admin-form">
            <label><span>Response status</span><select value={requestForm.status} onChange={(event) => setRequestForm({ ...requestForm, status: event.target.value })}>{["submitted","acknowledged","team-assigned","en-route","in-progress","resolved","closed","cancelled"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><label><span>Assigned team</span><input value={requestForm.assignedTeam} onChange={(event) => setRequestForm({ ...requestForm, assignedTeam: event.target.value })} placeholder="Example: Electrical response team" /></label><label className="wide"><span>Customer-facing response update</span><textarea rows="4" value={requestForm.responseNote} onChange={(event) => setRequestForm({ ...requestForm, responseNote: event.target.value })} placeholder="Example: Team dispatched and expected on site within 45 minutes." /></label>
          </div><footer><button type="button" onClick={() => setDialog("")}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Updating..." : "Update & notify customer"}</button></footer></form>}
        </section>
      </div>}
    </AdminLayout>
  );
}

export default AdminMaintenance;
