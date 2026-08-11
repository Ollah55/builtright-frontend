import React, { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiMapPin,
  FiPower,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiWifi,
  FiWifiOff,
  FiX,
} from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { demoDevices } from "../../lib/operations";
import { providerState, sendAshGridDeviceControl } from "../../services/providerAdapters";
import "./adminDevices.css";

const deviceFilters = [
  { id: "all", label: "All devices" },
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
  { id: "tamper", label: "Tamper alerts" },
  { id: "grace-period", label: "Grace period" },
];

function AdminDevices() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(demoDevices[0].id);
  const [controlIntent, setControlIntent] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const devices = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return demoDevices.filter((device) => {
      const matchesFilter =
        filter === "all" ||
        device.connectivity === filter ||
        (filter === "tamper" && device.tamper) ||
        device.payment === filter;
      const matchesSearch = !search || [device.id, device.deviceNumber, device.customer, device.project, device.site].some((value) => value.toLowerCase().includes(search));
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const selectedDevice = demoDevices.find((device) => device.id === selectedId) || demoDevices[0];
  const canDisable =
    selectedDevice.state !== "off" &&
    selectedDevice.payment === "default-eligible" &&
    selectedDevice.graceDays >= 10 &&
    selectedDevice.connectivity === "online";
  const disableReason =
    selectedDevice.payment === "current"
      ? "Disablement is locked because this customer is current."
      : selectedDevice.graceDays < 10
        ? `Disablement is locked until the 10-day grace period is complete (${selectedDevice.graceDays}/10 days).`
        : selectedDevice.connectivity !== "online"
          ? "Disablement is locked until device connectivity is restored and verified."
          : "Disablement requires authorized human confirmation.";
  const paymentStandingLabel = {
    current: "Current",
    "grace-period": "Grace period active",
    "default-eligible": "Default verified - eligible for review",
    cleared: "Payment cleared",
  }[selectedDevice.payment] || "Standing not confirmed";

  const openControl = (intent) => {
    setConfirmationText("");
    setControlIntent(intent);
  };

  const closeControl = () => {
    setConfirmationText("");
    setControlIntent(null);
  };

  const submitControl = async () => {
    if (!controlIntent || !providerState.ashGridX.configured) return;
    setSending(true);
    try {
      await sendAshGridDeviceControl({
        customerDeviceId: selectedDevice.id,
        control: controlIntent,
        reason: controlIntent === "off" ? "Authorized BuiltRight admin action" : "Payment cleared and activation authorized",
        confirmation: confirmationText,
      });
      setMessage(`The ${controlIntent} command was submitted for ${selectedDevice.deviceNumber}.`);
      closeControl();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout
      title="Device control centre"
      subtitle="Assign multiple AshGridX devices to financed projects, monitor connectivity and tamper signals, and keep every control action auditable."
      actions={<button type="button" className="ops-button primary"><FiCpu /> Add device assignment</button>}
    >
      <section className="device-policy-banner">
        <FiShield />
        <div>
          <strong>Pilot safety policy</strong>
          <p>Automatic shutdown is off. Disablement requires a verified default, completed 10-day grace period, recorded communications, and authorized human confirmation.</p>
        </div>
        <span>Manual approval</span>
      </section>

      {message && <div className="finance-message" role="status">{message}</div>}

      <section className="device-stat-grid">
        <article><span className="online"><FiWifi /></span><div><p>Online devices</p><strong>{demoDevices.filter((device) => device.connectivity === "online").length}</strong><small>Last checked 30 sec ago</small></div></article>
        <article><span className="offline"><FiWifiOff /></span><div><p>Offline devices</p><strong>{demoDevices.filter((device) => device.connectivity === "offline").length}</strong><small>Needs investigation</small></div></article>
        <article><span className="danger"><FiAlertTriangle /></span><div><p>Open tamper alerts</p><strong>{demoDevices.filter((device) => device.tamper).length}</strong><small>Pilot device AGX-0003</small></div></article>
        <article><span className="warning"><FiClock /></span><div><p>Grace period</p><strong>{demoDevices.filter((device) => device.payment === "grace-period").length}</strong><small>4 of 10 days elapsed</small></div></article>
      </section>

      <section className="device-workspace">
        <div className="device-register ops-card">
          <div className="device-register-toolbar">
            <div className="finance-search"><FiSearch /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search device, customer, site or project" /></div>
            <button type="button" aria-label="Refresh device list"><FiRefreshCw /></button>
          </div>

          <div className="device-filter-tabs">
            {deviceFilters.map((item) => <button type="button" key={item.id} className={filter === item.id ? "active" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </div>

          <div className="device-list">
            {devices.map((device) => (
              <button type="button" className={selectedId === device.id ? "active" : ""} key={device.id} onClick={() => setSelectedId(device.id)}>
                <span className={`device-list-signal ${device.connectivity}`}>{device.connectivity === "online" ? <FiWifi /> : <FiWifiOff />}</span>
                <span className="device-list-copy"><strong>{device.deviceNumber}</strong><small>{device.customer} - {device.site}</small><i>{device.id}</i></span>
                <span className="device-list-state"><i className={`status-pill ${device.tamper ? "danger" : device.connectivity === "online" ? "success" : "warning"}`}>{device.tamper ? "Tamper" : device.connectivity}</i><small>{device.lastSeen}</small></span>
              </button>
            ))}
          </div>
        </div>

        <aside className="device-detail ops-card">
          <div className="device-detail-head">
            <div><p className="ops-section-kicker">Selected asset</p><h2>{selectedDevice.deviceNumber}</h2><span>{selectedDevice.id}</span></div>
            <i className={`status-pill ${selectedDevice.state === "on" ? "success" : "danger"}`}>{selectedDevice.state === "on" ? "Active" : "Disabled"}</i>
          </div>

          {selectedDevice.tamper && (
            <div className="tamper-incident"><FiAlertTriangle /><div><strong>Tamper signal requires investigation</strong><p>The pilot device is offline. Confirm whether this is a cable disconnection, maintenance event, power loss, or network outage.</p></div></div>
          )}

          <div className="device-detail-grid">
            <div><span>Customer</span><strong>{selectedDevice.customer}</strong></div>
            <div><span>Project</span><strong>{selectedDevice.project}</strong></div>
            <div><span>Installation site</span><strong><FiMapPin /> {selectedDevice.site}</strong></div>
            <div><span>Installed</span><strong>{selectedDevice.installed}</strong></div>
            <div><span>Connectivity</span><strong className={selectedDevice.connectivity}>{selectedDevice.connectivity}</strong></div>
            <div><span>Last seen</span><strong>{selectedDevice.lastSeen}</strong></div>
          </div>

          <section className="device-payment-card">
            <div><p>Payment standing</p><strong>{paymentStandingLabel}</strong></div>
            <span>{selectedDevice.graceDays}/10 days</span>
            <div className="grace-meter"><i style={{ width: `${selectedDevice.graceDays * 10}%` }} /></div>
          </section>

          <div className="device-control-actions">
            <button type="button" className="activate" disabled={selectedDevice.state === "on"} onClick={() => openControl("on")}><FiPower /> Activate</button>
            <button type="button" className="disable" disabled={!canDisable} title={disableReason} onClick={() => openControl("off")}><FiPower /> Disable</button>
          </div>
          {!canDisable && selectedDevice.state !== "off" && <p className="device-control-lock"><FiShield /> {disableReason}</p>}

          <section className="device-audit-preview">
            <div className="device-audit-head"><p>Recent device activity</p><button type="button">Full audit log</button></div>
            <div><span className="success"><FiCheckCircle /></span><p><strong>Device state checked</strong><small>System reported {selectedDevice.state} - {selectedDevice.lastSeen}</small></p></div>
            {selectedDevice.tamper && <div><span className="danger"><FiAlertTriangle /></span><p><strong>Possible tamper event</strong><small>Awaiting verified AshGridX event definition</small></p></div>}
            <div><span><FiClock /></span><p><strong>Assignment reviewed</strong><small>BuiltRight operations - 11 Aug 2026</small></p></div>
          </section>
        </aside>
      </section>

      {controlIntent && (
        <div className="device-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) closeControl(); }}>
          <div className="device-control-modal" role="dialog" aria-modal="true" aria-label={`${controlIntent} ${selectedDevice.deviceNumber}`}>
            <button type="button" className="modal-close" onClick={closeControl} aria-label="Close"><FiX /></button>
            <span className={`control-modal-icon ${controlIntent}`}><FiPower /></span>
            <p className="ops-section-kicker">High-trust action</p>
            <h2>{controlIntent === "off" ? "Disable inverter system?" : "Activate inverter system?"}</h2>
            <p>This action targets <strong>{selectedDevice.deviceNumber}</strong>, assigned to <strong>{selectedDevice.customer}</strong> at {selectedDevice.site}.</p>
            <div className="provider-pending-note"><FiShield /><span><strong>AshGridX is not connected.</strong> The interface is ready, but no command can leave BuiltRight until staging credentials and confirmation rules are configured.</span></div>
            <label className="device-command-confirmation">
              <span>Type <strong>{selectedDevice.id}</strong> to confirm</span>
              <input value={confirmationText} onChange={(event) => setConfirmationText(event.target.value)} placeholder={selectedDevice.id} autoComplete="off" />
            </label>
            <div className="device-modal-actions">
              <button type="button" className="ops-button secondary" onClick={closeControl}>Cancel</button>
              <button type="button" className={controlIntent === "off" ? "ops-button danger" : "ops-button primary"} disabled={!providerState.ashGridX.configured || sending || confirmationText !== selectedDevice.id} onClick={submitControl}>{sending ? "Sending..." : providerState.ashGridX.configured ? `Confirm ${controlIntent}` : "Connection required"}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDevices;
