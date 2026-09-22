import React, { useEffect, useMemo, useState } from "react";
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
import { providerState, sendAshGridDeviceControl, simulateAshGridEvent } from "../../services/providerAdapters";
import "./adminDevices.css";

const deviceFilters = [
  { id: "all", label: "All devices" },
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
  { id: "tamper", label: "Tamper alerts" },
  { id: "grace-period", label: "Grace period" },
];

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function normalizeDevice(device) {
  const graceStartedAt = device.gracePeriod?.startedAt ? new Date(device.gracePeriod.startedAt) : null;
  const graceDays = graceStartedAt ? Math.max(0, Math.min(10, Math.floor((Date.now() - graceStartedAt.getTime()) / 86400000))) : 0;
  return {
    ...device,
    id: device._id,
    deviceNumber: device.deviceNumber || device.reference,
    customerDeviceId: device.customerDeviceId || device.providerDeviceId || "",
    customer: device.customerSnapshot?.fullName || "Unassigned customer",
    project: device.projectReference || "No project reference",
    site: device.site?.address || "Site not recorded",
    state: device.inverterState || "unknown",
    payment: device.paymentStanding || "unknown",
    graceDays,
    tamper: device.tamper?.status && device.tamper.status !== "clear",
    installed: device.installedAt ? new Date(device.installedAt).toLocaleDateString("en-NG") : "Not installed",
    lastSeen: device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString("en-NG") : "Never",
  };
}

function AdminDevices() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [deviceRecords, setDeviceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [controlIntent, setControlIntent] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({ deviceNumber: "", customerDeviceId: "", serialNumber: "", siteAddress: "" });

  const loadDevices = async () => {
    try {
      const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/devices`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not load devices.");
      const normalized = (data.devices || []).map(normalizeDevice);
      setDeviceRecords(normalized);
      setSelectedId((current) => current || normalized[0]?.id || "");
    } catch (error) {
      setMessage(error.message || "Could not load devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDevices(); }, []);

  const devices = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return deviceRecords.filter((device) => {
      const matchesFilter =
        filter === "all" ||
        device.connectivity === filter ||
        (filter === "tamper" && device.tamper) ||
        device.payment === filter;
      const matchesSearch = !search || [device.id, device.deviceNumber, device.customer, device.project, device.site].some((value) => value.toLowerCase().includes(search));
      return matchesFilter && matchesSearch;
    });
  }, [deviceRecords, filter, searchTerm]);

  const selectedDevice = deviceRecords.find((device) => device.id === selectedId) || deviceRecords[0] || {
    id: "",
    deviceNumber: "No device selected",
    customer: "No live devices registered",
    project: "",
    site: "",
    state: "unknown",
    connectivity: "unknown",
    payment: "unknown",
    graceDays: 0,
    tamper: false,
    installed: "",
    lastSeen: "",
  };
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
        customerDeviceId: selectedDevice.customerDeviceId,
        deviceNumber: selectedDevice.deviceNumber,
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

  const simulateTamper = async () => {
    if (!selectedDevice.id) return;
    setSimulating(true);
    try {
      await simulateAshGridEvent(selectedDevice.id, "BYPASS");
      setMessage(`Test BYPASS/tamper event recorded for ${selectedDevice.deviceNumber}.`);
      await loadDevices();
    } catch (error) {
      setMessage(error.message || "Could not record the test event.");
    } finally {
      setSimulating(false);
    }
  };

  const registerDevice = async (event) => {
    event.preventDefault();
    if (!registerForm.deviceNumber.trim()) return;
    setRegistering(true);
    try {
      const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/admin/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reference: registerForm.deviceNumber.trim().toUpperCase(),
          providerDeviceId: registerForm.customerDeviceId.trim() || undefined,
          customerDeviceId: registerForm.customerDeviceId.trim() || undefined,
          serialNumber: registerForm.serialNumber.trim(),
          site: { address: registerForm.siteAddress.trim() },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not register device.");
      setRegisterForm({ deviceNumber: "", customerDeviceId: "", serialNumber: "", siteAddress: "" });
      setMessage(`Device ${registerForm.deviceNumber.toUpperCase()} was registered for the pilot.`);
      setRegistering(false);
      setRegisterModalOpen(false);
      await loadDevices();
    } catch (error) {
      setMessage(error.message || "Could not register device.");
      setRegistering(false);
    }
  };

  return (
    <AdminLayout
      title="Device control centre"
      subtitle="Assign multiple AshGridX devices to financed projects, monitor connectivity and tamper signals, and keep every control action auditable."
      actions={<button type="button" className="ops-button primary" onClick={() => setRegisterModalOpen(true)}><FiCpu /> Add device assignment</button>}
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
        <article><span className="online"><FiWifi /></span><div><p>Online devices</p><strong>{deviceRecords.filter((device) => device.connectivity === "online").length}</strong><small>Live provider state</small></div></article>
        <article><span className="offline"><FiWifiOff /></span><div><p>Offline devices</p><strong>{deviceRecords.filter((device) => device.connectivity === "offline").length}</strong><small>Needs investigation</small></div></article>
        <article><span className="danger"><FiAlertTriangle /></span><div><p>Open tamper alerts</p><strong>{deviceRecords.filter((device) => device.tamper).length}</strong><small>Provider alerts only</small></div></article>
        <article><span className="warning"><FiClock /></span><div><p>Grace period</p><strong>{deviceRecords.filter((device) => device.payment === "grace-period").length}</strong><small>Based on recorded default dates</small></div></article>
      </section>

      <section className="device-workspace">
        <div className="device-register ops-card">
          <div className="device-register-toolbar">
            <div className="finance-search"><FiSearch /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search device, customer, site or project" /></div>
            <button type="button" aria-label="Refresh device list" onClick={loadDevices}><FiRefreshCw /></button>
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
            {!loading && devices.length === 0 && <p className="ops-empty-note">No live devices match this filter.</p>}
          </div>
        </div>

        <aside className="device-detail ops-card">
          <div className="device-detail-head">
            <div><p className="ops-section-kicker">Selected asset</p><h2>{selectedDevice.deviceNumber}</h2><span>{selectedDevice.id}</span></div>
            <i className={`status-pill ${selectedDevice.state === "on" ? "success" : "danger"}`}>{selectedDevice.state === "on" ? "Active" : "Disabled"}</i>
          </div>

          {selectedDevice.tamper && (
            <div className="tamper-incident"><FiAlertTriangle /><div><strong>AshGridX BYPASS signal requires investigation</strong><p>A cable disconnection/protection bypass was reported for this device. Confirm the inverter and wiring at the assigned site.</p></div></div>
          )}

          <div className="device-detail-grid">
            <div><span>Customer</span><strong>{selectedDevice.customer}</strong></div>
            <div><span>Project</span><strong>{selectedDevice.project}</strong></div>
            <div><span>Installation site</span><strong><FiMapPin /> {selectedDevice.site}</strong></div>
            <div><span>Installed</span><strong>{selectedDevice.installed}</strong></div>
            <div><span>Connectivity</span><strong className={selectedDevice.connectivity}>{selectedDevice.connectivity}</strong></div>
            <div><span>Last seen</span><strong>{selectedDevice.lastSeen}</strong></div>
            <div><span>AshGridX customerDeviceId</span><strong>{selectedDevice.customerDeviceId || "Pending onboarding"}</strong></div>
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
            <div className="device-audit-head"><p>Recent device activity</p><button type="button" onClick={simulateTamper} disabled={!selectedDevice.id || simulating}>{simulating ? "Recording..." : "Test tamper event"}</button></div>
            <div><span className="success"><FiCheckCircle /></span><p><strong>Device state checked</strong><small>System reported {selectedDevice.state} - {selectedDevice.lastSeen}</small></p></div>
            {selectedDevice.tamper && <div><span className="danger"><FiAlertTriangle /></span><p><strong>AshGridX BYPASS / cable disconnection</strong><small>Provider tamper event recorded; investigate the assigned site.</small></p></div>}
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

      {registerModalOpen && (
        <div className="device-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setRegisterModalOpen(false); }}>
          <form className="device-control-modal" onSubmit={registerDevice}>
            <button type="button" className="modal-close" onClick={() => setRegisterModalOpen(false)} aria-label="Close"><FiX /></button>
            <span className="control-modal-icon on"><FiCpu /></span>
            <p className="ops-section-kicker">Pilot onboarding</p>
            <h2>Register AshGridX device</h2>
            <p>Use the BuiltRight deviceNumber on every webhook and add the AshGridX customerDeviceId when it is issued during onboarding.</p>
            <label className="device-command-confirmation">BuiltRight deviceNumber<input required value={registerForm.deviceNumber} onChange={(event) => setRegisterForm({ ...registerForm, deviceNumber: event.target.value })} placeholder="BR-ASH-001" /></label>
            <label className="device-command-confirmation">AshGridX customerDeviceId<input value={registerForm.customerDeviceId} onChange={(event) => setRegisterForm({ ...registerForm, customerDeviceId: event.target.value })} placeholder="Issued by AshGridX" /></label>
            <label className="device-command-confirmation">Serial number<input value={registerForm.serialNumber} onChange={(event) => setRegisterForm({ ...registerForm, serialNumber: event.target.value })} /></label>
            <label className="device-command-confirmation">Installation site<input value={registerForm.siteAddress} onChange={(event) => setRegisterForm({ ...registerForm, siteAddress: event.target.value })} placeholder="Customer property address" /></label>
            <div className="device-modal-actions"><button type="button" className="ops-button secondary" onClick={() => setRegisterModalOpen(false)}>Cancel</button><button type="submit" className="ops-button primary" disabled={registering}>{registering ? "Registering..." : "Register device"}</button></div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDevices;
