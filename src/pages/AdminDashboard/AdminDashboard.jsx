import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiCreditCard,
  FiFileText,
  FiMapPin,
  FiTool,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import {
  demoAlerts,
  demoDevices,
  demoFinancingRequests,
  getFinancingStage,
  integrationReadiness,
  statusTone,
} from "../../lib/operations";
import "./adminDashboard.css";

const stageSummary = [
  { label: "New requests", value: 6, tone: "neutral" },
  { label: "Inspection", value: 4, tone: "warning" },
  { label: "Quotation", value: 3, tone: "teal" },
  { label: "Bank review", value: 5, tone: "violet" },
  { label: "Approved", value: 2, tone: "success" },
  { label: "Disbursed", value: 1, tone: "success" },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const onlineDevices = demoDevices.filter((device) => device.connectivity === "online").length;
  const tamperAlerts = demoDevices.filter((device) => device.tamper).length;

  const metrics = [
    {
      label: "Active financing",
      value: "21",
      note: "Across the full review pipeline",
      icon: FiCreditCard,
      tone: "teal",
      trend: "+4 this week",
    },
    {
      label: "Inspections due",
      value: "4",
      note: "2 scheduled within 48 hours",
      icon: FiFileText,
      tone: "amber",
      trend: "Needs scheduling",
    },
    {
      label: "Active projects",
      value: "8",
      note: "Delivery through commissioning",
      icon: FiTool,
      tone: "navy",
      trend: "3 installations",
    },
    {
      label: "Device alerts",
      value: String(tamperAlerts),
      note: "Pilot device requires attention",
      icon: FiAlertTriangle,
      tone: "red",
      trend: "Open incident",
    },
  ];

  return (
    <AdminLayout
      title="Operations overview"
      subtitle="A single view of financing, inspections, quotations, fulfilment, installation, and financed solar assets."
      actions={
        <>
          <button className="ops-button secondary" type="button" onClick={() => navigate("/admin/projects")}>View projects</button>
          <button className="ops-button primary" type="button" onClick={() => navigate("/admin/loan-requests")}>Review financing <FiArrowUpRight /></button>
        </>
      }
    >
      <section className="overview-context-strip">
        <div>
          <span className="context-dot" />
          <p><strong>Sandbox workspace:</strong> live BuiltRight operations can continue manually while bank and AshGridX connections remain isolated.</p>
        </div>
        <button type="button" onClick={() => navigate("/admin/integrations")}>Integration readiness <FiArrowUpRight /></button>
      </section>

      <section className="overview-metrics" aria-label="Operations metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="overview-metric" key={metric.label}>
              <div className={`metric-icon ${metric.tone}`}><Icon /></div>
              <div className="metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </div>
              <small>{metric.trend}</small>
            </article>
          );
        })}
      </section>

      <section className="overview-grid primary-grid">
        <article className="ops-card pipeline-card">
          <div className="ops-card-head">
            <div>
              <p className="ops-section-kicker">Financing pipeline</p>
              <h2>From interest to disbursement</h2>
            </div>
            <button type="button" className="text-button" onClick={() => navigate("/admin/loan-requests")}>Open pipeline <FiArrowUpRight /></button>
          </div>

          <div className="pipeline-stage-grid">
            {stageSummary.map((stage, index) => (
              <div className="pipeline-stage" key={stage.label}>
                <div className="pipeline-stage-label">
                  <span className={`stage-dot ${stage.tone}`} />
                  <p>{stage.label}</p>
                </div>
                <strong>{stage.value}</strong>
                <div className="pipeline-stage-bar"><span style={{ width: `${Math.max(22, 100 - index * 13)}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="pipeline-note">
            <FiCheckCircle />
            <p>Confirmed orders are created only after verified bank disbursement, not at approval.</p>
          </div>
        </article>

        <article className="ops-card attention-card">
          <div className="ops-card-head compact">
            <div>
              <p className="ops-section-kicker">Attention queue</p>
              <h2>What needs action</h2>
            </div>
            <span className="count-badge">{demoAlerts.length}</span>
          </div>

          <div className="attention-list">
            {demoAlerts.map((alert) => (
              <button type="button" key={alert.id} onClick={() => navigate(alert.route)}>
                <span className={`attention-severity ${alert.severity}`} />
                <span className="attention-copy">
                  <strong>{alert.title}</strong>
                  <small>{alert.detail}</small>
                </span>
                <time>{alert.time}</time>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="overview-grid secondary-grid">
        <article className="ops-card work-queue-card">
          <div className="ops-card-head">
            <div>
              <p className="ops-section-kicker">Financing work queue</p>
              <h2>Next customer actions</h2>
            </div>
            <button type="button" className="text-button" onClick={() => navigate("/admin/loan-requests")}>View all</button>
          </div>

          <div className="work-queue-table" role="table">
            <div className="work-queue-row work-queue-header" role="row">
              <span>Customer</span><span>System</span><span>Stage</span><span>Next action</span>
            </div>
            {demoFinancingRequests.map((request) => {
              const stage = getFinancingStage(request.status);
              return (
                <button type="button" className="work-queue-row" role="row" key={request._id} onClick={() => navigate("/admin/loan-requests")}>
                  <span><strong>{request.customer.fullName}</strong><small>{request.reference}</small></span>
                  <span><strong>{request.systemCapacity}</strong><small>{request.customer.location}</small></span>
                  <span><i className={`status-pill ${statusTone(request.status)}`}>{stage.label}</i></span>
                  <span><strong>{request.nextAction}</strong><FiArrowUpRight /></span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="ops-card device-card">
          <div className="ops-card-head compact">
            <div>
              <p className="ops-section-kicker">Financed assets</p>
              <h2>Device health</h2>
            </div>
            <div className="device-health-ring"><strong>{onlineDevices}</strong><span>online</span></div>
          </div>

          <div className="device-health-list">
            {demoDevices.map((device) => (
              <button type="button" key={device.id} onClick={() => navigate("/admin/devices")}>
                <span className={`device-connectivity ${device.connectivity}`}>
                  {device.connectivity === "online" ? <FiWifi /> : <FiWifiOff />}
                </span>
                <span>
                  <strong>{device.deviceNumber}</strong>
                  <small><FiMapPin /> {device.site}</small>
                </span>
                <i className={`status-pill ${device.tamper ? "danger" : "success"}`}>{device.tamper ? "Tamper" : device.state}</i>
              </button>
            ))}
          </div>
          <button type="button" className="ops-button secondary full" onClick={() => navigate("/admin/devices")}><FiCpu /> Open device centre</button>
        </article>
      </section>

      <section className="integration-mini-grid">
        {integrationReadiness.map((integration) => (
          <article className="integration-mini-card" key={integration.id}>
            <div>
              <span className={`integration-mark ${integration.tone}`} />
              <div>
                <p>{integration.name}</p>
                <strong>{integration.status}</strong>
              </div>
            </div>
            <span className="integration-progress"><i style={{ width: `${integration.readiness}%` }} /></span>
            <small>{integration.readiness}% interface readiness</small>
          </article>
        ))}
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
