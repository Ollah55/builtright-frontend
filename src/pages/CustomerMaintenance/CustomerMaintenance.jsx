import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiPlus,
  FiShield,
  FiTool,
  FiX,
} from "react-icons/fi";
import CustomerLayout from "../../components/CustomerLayout/CustomerLayout";
import useLiveRefresh from "../../hooks/useLiveRefresh";
import "./customerMaintenance.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const OPEN_STATUSES = new Set(["submitted", "acknowledged", "team-assigned", "en-route", "in-progress"]);
const titleCase = (value = "") => String(value).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value, fallback = "Not scheduled") => value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : fallback;
const formatMoney = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function CustomerMaintenance() {
  const token = localStorage.getItem("customerToken");
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "electrical", priority: "normal", title: "", description: "", locationWithinProperty: "", safeToRemainOnSite: true });

  const loadMaintenance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/maintenance`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load your maintenance portal.");
      setProperties(data.properties || []);
      setRequests(data.requests || []);
      setSelectedPropertyId((current) => current || data.properties?.[0]?._id || "");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMaintenance(); }, [token]);
  useLiveRefresh(loadMaintenance, { enabled: !submitting && !dialog });

  const selectedProperty = properties.find((item) => item._id === selectedPropertyId) || properties[0] || null;
  const propertyRequests = useMemo(
    () => requests.filter((item) => String(item.property) === String(selectedProperty?._id)),
    [requests, selectedProperty]
  );
  const openRequests = propertyRequests.filter((item) => OPEN_STATUSES.has(item.status));
  const onboarding = selectedProperty?.onboarding || {};
  const nextVisit = selectedProperty?.visits
    ?.filter((visit) => visit.status === "scheduled" && new Date(visit.scheduledFor) >= new Date())
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0];

  const closeDialog = () => {
    setDialog("");
    setForm({ category: "electrical", priority: "normal", title: "", description: "", locationWithinProperty: "", safeToRemainOnSite: true });
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!selectedProperty) return;
    setSubmitting(true);
    setMessage("");
    const emergency = dialog === "emergency";
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/maintenance/${emergency ? "emergency" : "requests"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, propertyId: selectedProperty._id, title: emergency ? (form.title || "Emergency assistance required") : form.title }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not submit this request.");
      setRequests((items) => [data.request, ...items]);
      setMessage(data.message);
      closeDialog();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <main className="maintenance-portal">
        <section className="maintenance-hero">
          <div>
            <p>BuiltRight Care</p>
            <h1>Your facility, always in view</h1>
            <span>Monitor building condition, subscription coverage, planned visits, service requests, and emergency response from one place.</span>
          </div>
          <div className="maintenance-hero-actions">
            <button type="button" className="maintenance-service-button" onClick={() => setDialog("service")} disabled={!selectedProperty}><FiPlus /> Request service</button>
            <button type="button" className="maintenance-emergency-button" onClick={() => setDialog("emergency")} disabled={!selectedProperty}><FiAlertTriangle /> Emergency alert</button>
          </div>
        </section>

        {message && <p className="maintenance-message" role="status">{message}</p>}

        {loading ? (
          <section className="maintenance-empty">Loading your facilities...</section>
        ) : properties.length === 0 ? (
          <section className="maintenance-empty maintenance-empty-onboarding">
            <FiHome />
            <h2>No property is connected yet</h2>
            <p>After BuiltRight completes onboarding and activates your maintenance plan, your building health and service coverage will appear here.</p>
            <a href="https://wa.me/2349134991239?text=Hello%20BuiltRight,%20I%20want%20to%20onboard%20my%20property%20for%20a%20maintenance%20plan" target="_blank" rel="noreferrer">Speak with maintenance support</a>
          </section>
        ) : (
          <>
            <section className="maintenance-property-switcher" aria-label="Choose a property">
              {properties.map((item) => (
                <button type="button" key={item._id} className={item._id === selectedProperty?._id ? "active" : ""} onClick={() => setSelectedPropertyId(item._id)}>
                  <FiHome /><span><strong>{item.property.name}</strong><small>{item.property.address}</small></span>
                </button>
              ))}
            </section>

            <section className="maintenance-onboarding-panel">
              <header><div><p>Contract onboarding</p><h2>{titleCase(onboarding.stage || "site-inspection-pending")}</h2></div><span>{selectedProperty.reference}</span></header>
              <div className="maintenance-onboarding-steps">
                <article className={onboarding.inspection?.completedAt ? "complete" : "current"}><i>{onboarding.inspection?.completedAt ? <FiCheckCircle /> : "1"}</i><div><strong>Inspection & due diligence</strong><small>{onboarding.inspection?.completedAt ? `Completed ${formatDate(onboarding.inspection.completedAt)}` : onboarding.inspection?.scheduledAt ? `Scheduled ${formatDate(onboarding.inspection.scheduledAt)}` : "BuiltRight inspection pending"}</small></div></article>
                <article className={["not-required","completed"].includes(onboarding.remediation?.status) ? "complete" : ["required","in-progress"].includes(onboarding.remediation?.status) ? "current" : ""}><i>{["not-required","completed"].includes(onboarding.remediation?.status) ? <FiCheckCircle /> : "2"}</i><div><strong>Remediation clearance</strong><small>{onboarding.remediation?.status === "not-required" ? "No remediation required" : onboarding.remediation?.status === "completed" ? "Required work completed" : onboarding.remediation?.status === "in-progress" ? "Corrective work in progress" : onboarding.remediation?.status === "required" ? "Corrective work required before contract" : "Decision follows due diligence"}</small></div></article>
                <article className={onboarding.probation?.paymentStatus === "paid" ? "complete" : onboarding.stage === "probation-payment-due" ? "current" : ""}><i>{onboarding.probation?.paymentStatus === "paid" ? <FiCheckCircle /> : "3"}</i><div><strong>Three-month payment</strong><small>{onboarding.probation?.paymentStatus === "paid" ? `${formatMoney(onboarding.probation.amount)} paid in full · non-refundable` : "Full probation payment due after clearance"}</small></div></article>
                <article className={["probation-review","contract-active","terminated"].includes(onboarding.stage) ? "complete" : onboarding.stage === "probation-active" ? "current" : ""}><i>{["probation-review","contract-active","terminated"].includes(onboarding.stage) ? <FiCheckCircle /> : "4"}</i><div><strong>Three-month probation</strong><small>{onboarding.probation?.startsAt ? `${formatDate(onboarding.probation.startsAt)} to ${formatDate(onboarding.probation.endsAt)}` : "Starts after payment confirmation"}</small></div></article>
                <article className={onboarding.stage === "contract-active" ? "complete" : ["probation-review","terminated"].includes(onboarding.stage) ? "current" : ""}><i>{onboarding.stage === "contract-active" ? <FiCheckCircle /> : "5"}</i><div><strong>Continue or terminate</strong><small>{onboarding.stage === "contract-active" ? "Continuing maintenance contract active" : onboarding.stage === "terminated" ? "Contract ended after review" : onboarding.stage === "probation-review" ? "Both parties are reviewing the relationship" : "Decision after the probation period"}</small></div></article>
              </div>
              {onboarding.remediation?.scope && <div className="maintenance-remediation-note"><strong>Remediation scope</strong><p>{onboarding.remediation.scope}</p></div>}
              <p className="maintenance-probation-term"><FiShield /> The first three months are a probationary period paid in full and non-refundable after any required remediation is completed. Either party may continue or terminate the contract after this period.</p>
            </section>

            <section className="maintenance-summary-grid">
              <article className={`maintenance-health-card ${selectedProperty.health?.status || "assessment-pending"}`}>
                <div className="maintenance-card-icon"><FiActivity /></div>
                <div><span>Facility health</span><strong>{titleCase(selectedProperty.health?.status || "assessment pending")}</strong><small>{selectedProperty.health?.score ? `${selectedProperty.health.score}% condition score` : "Awaiting first assessment"}</small></div>
              </article>
              <article>
                <div className="maintenance-card-icon"><FiShield /></div>
                <div><span>Subscription</span><strong>{titleCase(selectedProperty.subscription?.plan)} plan</strong><small className={`maintenance-plan-status ${selectedProperty.subscription?.status}`}>{titleCase(selectedProperty.subscription?.status)}</small></div>
              </article>
              <article>
                <div className="maintenance-card-icon"><FiCalendar /></div>
                <div><span>Next visit</span><strong>{nextVisit ? formatDate(nextVisit.scheduledFor) : "Not scheduled"}</strong><small>{nextVisit ? titleCase(nextVisit.type) : "BuiltRight will notify you"}</small></div>
              </article>
              <article>
                <div className="maintenance-card-icon"><FiTool /></div>
                <div><span>Open requests</span><strong>{openRequests.length}</strong><small>{openRequests.some((item) => item.requestType === "emergency") ? "Emergency response active" : "Service items being tracked"}</small></div>
              </article>
            </section>

            <div className="maintenance-content-grid">
              <section className="maintenance-panel maintenance-condition-panel">
                <header><div><p>Property status</p><h2>{selectedProperty.property.name}</h2></div><span className={`maintenance-health-badge ${selectedProperty.health?.status}`}>{titleCase(selectedProperty.health?.status)}</span></header>
                <div className="maintenance-property-address"><FiHome /><span>{selectedProperty.property.address}, {selectedProperty.property.city}, {selectedProperty.property.state}</span></div>
                <div className="maintenance-health-meter"><div><span>Building condition score</span><strong>{selectedProperty.health?.score || 0}%</strong></div><progress value={selectedProperty.health?.score || 0} max="100" /></div>
                <p className="maintenance-health-summary">{selectedProperty.health?.summary || "The first BuiltRight condition assessment is pending."}</p>
                <dl className="maintenance-detail-list">
                  <div><dt>Property type</dt><dd>{titleCase(selectedProperty.property.type)}</dd></div>
                  <div><dt>Last assessment</dt><dd>{formatDate(selectedProperty.health?.lastAssessmentAt, "Not completed")}</dd></div>
                  <div><dt>Care reference</dt><dd>{selectedProperty.reference}</dd></div>
                  <div><dt>Assigned technician</dt><dd>{selectedProperty.assignedTechnician?.fullName || "Not assigned yet"}</dd></div>
                </dl>
              </section>

              <section className="maintenance-panel maintenance-plan-panel">
                <header><div><p>Your coverage</p><h2>{titleCase(selectedProperty.subscription?.plan)} plan</h2></div><FiShield /></header>
                <div className="maintenance-subscription-meta">
                  <div><span>Billing cycle</span><strong>{titleCase(selectedProperty.subscription?.billingCycle)}</strong></div>
                  <div><span>Plan amount</span><strong>{selectedProperty.subscription?.amount ? formatMoney(selectedProperty.subscription.amount) : "Custom quote"}</strong></div>
                  <div><span>Next renewal</span><strong>{formatDate(selectedProperty.subscription?.nextRenewalAt, "To be confirmed")}</strong></div>
                </div>
                <h3>Covered services</h3>
                <ul className="maintenance-coverage-list">
                  {(selectedProperty.subscription?.coveredServices || []).map((service) => <li key={service}><FiCheckCircle /> {service}</li>)}
                  {!selectedProperty.subscription?.coveredServices?.length && <li>Coverage will appear after plan setup.</li>}
                </ul>
              </section>
            </div>

            <div className="maintenance-content-grid maintenance-lower-grid">
              <section className="maintenance-panel">
                <header><div><p>Live activity</p><h2>Requests & emergency response</h2></div><span>{propertyRequests.length} total</span></header>
                <div className="maintenance-request-list">
                  {propertyRequests.length === 0 ? <p className="maintenance-list-empty">No service requests yet.</p> : propertyRequests.map((request) => (
                    <article key={request._id} className={request.requestType === "emergency" ? "emergency" : ""}>
                      <div className="maintenance-request-top"><span className={`maintenance-request-icon ${request.requestType}`}><FiAlertTriangle /></span><div><small>{request.reference}</small><h3>{request.title}</h3></div><i className={`request-status ${request.status}`}>{titleCase(request.status)}</i></div>
                      <p>{request.description}</p>
                      {request.assignedTeam && <strong>Assigned: {request.assignedTeam}</strong>}
                      {request.responseNote && <blockquote>{request.responseNote}</blockquote>}
                      <footer><span><FiClock /> {formatDate(request.createdAt)}</span><span>{titleCase(request.category)}</span></footer>
                    </article>
                  ))}
                </div>
              </section>

              <section className="maintenance-panel">
                <header><div><p>Planned care</p><h2>Visits & maintained assets</h2></div><FiCalendar /></header>
                <div className="maintenance-visit-list">
                  {(selectedProperty.visits || []).slice().sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor)).slice(0, 5).map((visit) => (
                    <div key={visit._id}><span className={`visit-dot ${visit.status}`} /><div><strong>{titleCase(visit.type)} visit</strong><small>{formatDate(visit.scheduledFor)} · {visit.technician || "BuiltRight team"}</small></div><i>{titleCase(visit.status)}</i></div>
                  ))}
                  {!selectedProperty.visits?.length && <p className="maintenance-list-empty">No maintenance visits have been scheduled.</p>}
                </div>
                <div className="maintenance-assets">
                  <h3>Asset condition</h3>
                  {(selectedProperty.assets || []).map((asset) => <div key={asset._id}><span>{asset.name}<small>{titleCase(asset.category)}</small></span><i className={asset.condition}>{titleCase(asset.condition)}</i></div>)}
                  {!selectedProperty.assets?.length && <p className="maintenance-list-empty">Assets will appear after BuiltRight completes the facility register.</p>}
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {dialog && selectedProperty && (
        <div className="maintenance-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <form className={`maintenance-modal ${dialog === "emergency" ? "emergency" : ""}`} onSubmit={submitRequest}>
            <button type="button" className="maintenance-modal-close" onClick={closeDialog} aria-label="Close"><FiX /></button>
            <div className="maintenance-modal-heading"><span>{dialog === "emergency" ? <FiAlertTriangle /> : <FiTool />}</span><div><p>{selectedProperty.reference}</p><h2>{dialog === "emergency" ? "Trigger emergency response" : "Request maintenance service"}</h2><small>{selectedProperty.property.name}</small></div></div>
            {dialog === "emergency" && <div className="maintenance-safety-notice"><strong>Use this for urgent building faults.</strong><p>If there is immediate danger to life, fire, crime, or a medical emergency, move to safety and contact the appropriate public emergency service first.</p></div>}
            <div className="maintenance-form-grid">
              <label><span>Issue category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["electrical", "plumbing", "air-conditioning", "fire-safety", "security", "generator", "lift", "building", "other"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label>
              {dialog === "service" && <label><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>}
              {dialog === "service" && <label className="wide"><span>Request title</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Example: Water leak under kitchen sink" /></label>}
              <label className="wide"><span>Exact location inside the property</span><input value={form.locationWithinProperty} onChange={(event) => setForm({ ...form, locationWithinProperty: event.target.value })} placeholder="Example: Ground floor electrical room" /></label>
              <label className="wide"><span>{dialog === "emergency" ? "Describe what is happening now" : "Describe the fault or service needed"}</span><textarea required rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Include visible signs, when it started, and anything already switched off or isolated." /></label>
              {dialog === "emergency" && <label className="maintenance-safe-check wide"><input type="checkbox" checked={form.safeToRemainOnSite} onChange={(event) => setForm({ ...form, safeToRemainOnSite: event.target.checked })} /><span>People can safely remain on the property while waiting for a response.</span></label>}
            </div>
            <footer><button type="button" onClick={closeDialog}>Cancel</button><button type="submit" disabled={submitting}>{submitting ? "Sending..." : dialog === "emergency" ? "Trigger emergency alert" : "Submit service request"}</button></footer>
          </form>
        </div>
      )}
    </CustomerLayout>
  );
}

export default CustomerMaintenance;
