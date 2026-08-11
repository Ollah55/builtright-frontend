import React from "react";
import {
  FiCheck,
  FiClock,
  FiCode,
  FiCreditCard,
  FiCpu,
  FiExternalLink,
  FiKey,
  FiLink,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiX,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { integrationReadiness } from "../../lib/operations";
import "./adminIntegrations.css";

const plugPoints = [
  { label: "Hosted bank application button", path: "BANK_APPLICATION_URL", owner: "Server configuration", ready: true },
  { label: "Approved quotation delivery", path: "BANK_APPLICATION_EMAIL", owner: "Document workflow", ready: true },
  { label: "Bank application creation", path: "POST /api/integrations/bank/applications", owner: "Future bank adapter", ready: true },
  { label: "Bank status webhook", path: "POST /api/webhooks/bank/:provider", owner: "Bank adapter", ready: true },
  { label: "Device on/off control", path: "POST /api/integrations/ashgridx/device/control", owner: "AshGridX adapter", ready: true },
  { label: "AshGridX event webhook", path: "POST /api/webhooks/ashgridx", owner: "AshGridX adapter", ready: true },
];

function AdminIntegrations() {
  return (
    <AdminLayout
      title="Integration readiness"
      subtitle="Provider-neutral connection points keep manual operations working today and isolate future bank and AshGridX credentials from the portal interface."
      actions={<button type="button" className="ops-button secondary"><FiRefreshCw /> Run readiness check</button>}
    >
      <section className="integration-security-banner">
        <FiLock />
        <div><strong>Credentials remain server-side</strong><p>Bank tokens, AshGridX API keys, and webhook secrets will never be stored in or exposed to the browser.</p></div>
      </section>

      <section className="integration-card-grid">
        {integrationReadiness.map((integration) => (
          <article className="integration-provider-card" key={integration.id}>
            <header>
              <span className={`provider-icon ${integration.id}`}>{integration.id === "bank" ? <FiCreditCard /> : <FiCpu />}</span>
              <div><p>{integration.id === "bank" ? "Financing provider" : "Remote asset provider"}</p><h2>{integration.name}</h2></div>
              <i className={`status-pill ${integration.tone}`}>{integration.status}</i>
            </header>

            <p className="provider-description">{integration.description}</p>

            <div className="provider-progress-head"><span>Interface readiness</span><strong>{integration.readiness}%</strong></div>
            <div className="provider-progress"><i style={{ width: `${integration.readiness}%` }} /></div>

            <div className="provider-checks">
              {integration.checks.map((check) => (
                <div key={check.label}><span className={check.done ? "done" : "pending"}>{check.done ? <FiCheck /> : <FiClock />}</span><p>{check.label}</p></div>
              ))}
            </div>

            <footer>
              <button type="button" className="ops-button secondary" disabled><FiKey /> Credentials pending</button>
              <button type="button" className="text-button">View requirements <FiExternalLink /></button>
            </footer>
          </article>
        ))}
      </section>

      <section className="integration-lower-grid">
        <article className="ops-card plug-point-card">
          <div className="ops-card-head"><div><p className="ops-section-kicker">Reserved connection paths</p><h2>Backend plug points</h2></div><FiCode /></div>
          <p className="integration-card-copy">These routes define where provider-specific logic will connect. Their final server implementation remains intentionally inactive until credentials and signed webhook specifications are available.</p>
          <div className="plug-point-table">
            <div className="plug-point-row header"><span>Capability</span><span>Reserved backend path</span><span>Adapter</span><span>Status</span></div>
            {plugPoints.map((item) => (
              <div className="plug-point-row" key={item.path}><span>{item.label}</span><code>{item.path}</code><span>{item.owner}</span><i><FiCheck /> Modelled</i></div>
            ))}
          </div>
        </article>

        <article className="ops-card webhook-card">
          <div className="ops-card-head"><div><p className="ops-section-kicker">Event handling</p><h2>Webhook guardrails</h2></div><FiShield /></div>
          <div className="webhook-checklist">
            <div><FiCheck /><span><strong>Raw body verification</strong><small>Signature checked before JSON parsing.</small></span></div>
            <div><FiCheck /><span><strong>Replay protection</strong><small>Timestamp tolerance and event IDs required.</small></span></div>
            <div><FiCheck /><span><strong>Idempotent processing</strong><small>Duplicate events cannot create duplicate orders.</small></span></div>
            <div><FiCheck /><span><strong>Audit retention</strong><small>Payload hash, outcome, and correlation ID retained.</small></span></div>
          </div>
          <div className="webhook-pending"><FiClock /><p>Exact signature construction, retries, event catalogue, and timestamp format remain pending from each provider.</p></div>
        </article>
      </section>

      <section className="integration-activation-flow">
        <div><span>01</span><FiLink /><p><strong>Receive provider specification</strong><small>Confirm endpoints, events, identifiers, signatures, and error behaviour.</small></p></div>
        <div><span>02</span><FiCode /><p><strong>Complete server adapter</strong><small>Provider details stay behind the neutral BuiltRight interface.</small></p></div>
        <div><span>03</span><FiShield /><p><strong>Pass sandbox tests</strong><small>Replays, duplicate events, failed commands, and recovery are verified.</small></p></div>
        <div><span>04</span><FiCheck /><p><strong>Activate controlled pilot</strong><small>Production access remains gated behind authorization and audit controls.</small></p></div>
      </section>
    </AdminLayout>
  );
}

export default AdminIntegrations;
