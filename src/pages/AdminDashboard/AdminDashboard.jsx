import React, { useEffect, useState } from "react";
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
  getFinancingStage,
  integrationReadiness,
  statusTone,
} from "../../lib/operations";
import "./adminDashboard.css";

const stageSummary = [
  { label: "New requests", key: "newRequests", tone: "neutral" },
  { label: "Inspection", key: "inspection", tone: "warning" },
  { label: "Quotation", key: "quotation", tone: "teal" },
  { label: "Bank review", key: "bankReview", tone: "violet" },
  { label: "Approved", key: "approved", tone: "success" },
  { label: "Disbursed", key: "disbursed", tone: "success" },
];

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({ stats: {}, stageSummary: {}, recentLoanRequests: [], devices: [], deviceAlerts: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Could not load dashboard.");
        setDashboard(data);
      } catch (error) {
        setMessage(error.message || "Could not load dashboard data.");
      }
    };
    loadDashboard();
  }, []);

  const devices = dashboard.devices || [];
  const recentLoanRequests = dashboard.recentLoanRequests || [];
  const alerts = dashboard.deviceAlerts || [];
  const onlineDevices = devices.filter((device) => device.connectivity === "online").length;
  const tamperAlerts = devices.filter((device) => device.tamper?.status && device.tamper.status !== "clear").length;

  const metrics = [
    {
      label: "Active financing",
      value: String(dashboard.stats.totalLoanRequests || 0),
      note: "Across the full review pipeline",
      icon: FiCreditCard,
      tone: "teal",
      trend: `${dashboard.stageSummary?.newRequests || 0} new intake cases`,
    },
    {
      label: "Inspections due",
      value: String(dashboard.stats.inspectionsDue || 0),
      note: "2 scheduled within 48 hours",
      icon: FiFileText,
      tone: "amber",
      trend: dashboard.stats.inspectionsDue ? "Needs scheduling" : "No inspections due",
    },
    {
      label: "Active projects",
      value: String(dashboard.stats.activeProjects || 0),
      note: "Delivery through commissioning",
      icon: FiTool,
      tone: "navy",
      trend: `${dashboard.stageSummary?.disbursed || 0} in fulfilment`,
    },
    {
      label: "Device alerts",
      value: String(tamperAlerts),
      note: `${alerts.length} open or acknowledged alert${alerts.length === 1 ? "" : "s"}`,
      icon: FiAlertTriangle,
      tone: "red",
      trend: alerts.length ? "Review required" : "No open incidents",
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
      {message && <div className="finance-message" role="status">{message}</div>}
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
                <strong>{dashboard.stageSummary?.[stage.key] || 0}</strong>
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
            <span className="count-badge">{alerts.length}</span>
          </div>

          <div className="attention-list">
            {alerts.map((alert) => (
              <button type="button" key={alert._id} onClick={() => navigate("/admin/devices")}>
                <span className={`attention-severity ${alert.severity || "warning"}`} />
                <span className="attention-copy">
                  <strong>{alert.title || alert.type}</strong>
                  <small>{alert.detail || "Device alert requires review."}</small>
                </span>
                <time>{alert.occurredAt ? new Date(alert.occurredAt).toLocaleDateString("en-NG") : "Recent"}</time>
              </button>
            ))}
            {alerts.length === 0 && <p className="ops-empty-note">No live device alerts.</p>}
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
            {recentLoanRequests.map((request) => {
              const stage = getFinancingStage(request.status);
              return (
                <button type="button" className="work-queue-row" role="row" key={request._id} onClick={() => navigate("/admin/loan-requests")}>
                  <span><strong>{request.customer?.fullName || "Customer not recorded"}</strong><small>{request.reference}</small></span>
                  <span><strong>{request.systemCapacity || request.items?.[0]?.capacity || "Sizing pending"}</strong><small>{request.customer?.location || "Location pending"}</small></span>
                  <span><i className={`status-pill ${statusTone(request.status)}`}>{stage.label}</i></span>
                  <span><strong>{request.nextAction}</strong><FiArrowUpRight /></span>
                </button>
              );
            })}
            {recentLoanRequests.length === 0 && <p className="ops-empty-note">No live financing cases yet.</p>}
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
            {devices.map((device) => (
              <button type="button" key={device._id} onClick={() => navigate("/admin/devices")}>
                <span className={`device-connectivity ${device.connectivity}`}>
                  {device.connectivity === "online" ? <FiWifi /> : <FiWifiOff />}
                </span>
                <span>
                  <strong>{device.reference}</strong>
                  <small><FiMapPin /> {device.site?.address || "Site not recorded"}</small>
                </span>
                <i className={`status-pill ${device.tamper?.status && device.tamper.status !== "clear" ? "danger" : "success"}`}>{device.tamper?.status && device.tamper.status !== "clear" ? "Tamper" : device.inverterState}</i>
              </button>
            ))}
            {devices.length === 0 && <p className="ops-empty-note">No live devices registered.</p>}
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
