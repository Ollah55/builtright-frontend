import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiPlay, FiRefreshCw, FiTrash2, FiZap } from "react-icons/fi";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminTestCentre.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function AdminTestCentre() {
  const [data, setData] = useState({ readiness: { checks: [] }, scenarios: [], runs: [] });
  const [scenario, setScenario] = useState("builtright-financing");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");

  const request = async (path, options = {}) => {
    const token = localStorage.getItem("builtright_admin_token") || localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const raw = await response.text();
    let result;
    try {
      result = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`Operations API returned an invalid response (${response.status}). Please retry shortly.`);
    }
    if (!response.ok || !result.status) throw new Error(result.message || "Operations test request failed.");
    return result;
  };

  const load = async () => {
    try {
      setLoading(true);
      setData(await request("/api/admin/operations-tests"));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createRun = async () => {
    try {
      setWorking("create");
      const result = await request("/api/admin/operations-tests", { method: "POST", body: JSON.stringify({ scenario }) });
      setMessage(result.message);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setWorking("");
    }
  };

  const advance = async (runId, runAll = false) => {
    try {
      setWorking(runId);
      let result;
      do {
        result = await request(`/api/admin/operations-tests/${runId}/next`, { method: "POST" });
      } while (runAll && !result.completed);
      setMessage(result.message);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setWorking("");
    }
  };

  const removeRun = async (runId) => {
    if (!window.confirm("Remove this controlled test run and its generated test documents?")) return;
    try {
      setWorking(runId);
      const result = await request(`/api/admin/operations-tests/${runId}`, { method: "DELETE" });
      setMessage(result.message);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setWorking("");
    }
  };

  return (
    <AdminLayout title="Operations Test Centre" subtitle="Run labelled end-to-end scenarios against the real workflow without sending customer emails, charging payments, or calling external providers." actions={<button className="ops-button secondary" type="button" onClick={load}><FiRefreshCw /> Refresh</button>}>
      {message && <div className="finance-message" role="status">{message}</div>}
      <section className="test-centre-banner"><FiZap /><div><strong>Controlled test data only</strong><p>Runs are marked as test records and excluded from production financing, installer workboards, dashboard counts, and customer views.</p></div></section>
      <section className="test-readiness-grid">
        {(data.readiness?.checks || []).map((check) => <article key={check.id} className={check.ready ? "ready" : "pending"}><FiCheckCircle /><div><strong>{check.label}</strong><small>{check.detail}</small></div><span>{check.ready ? "Ready" : check.required ? "Required" : "Pending"}</span></article>)}
      </section>
      <section className="ops-card test-create-card">
        <div><p className="ops-section-kicker">New verification run</p><h2>Choose an operating path</h2><span>Each run creates a disposable customer, assessment, quotation, and fulfilment record.</span></div>
        <div className="test-create-controls"><select value={scenario} onChange={(event) => setScenario(event.target.value)}>{(data.scenarios || []).map((item) => <option key={item.id} value={item.id}>{item.label} ({item.stepCount} checkpoints)</option>)}</select><button className="ops-button primary" type="button" disabled={working === "create" || !data.readiness?.coreReady} onClick={createRun}><FiPlay /> {working === "create" ? "Creating..." : "Create test run"}</button></div>
      </section>
      <section className="ops-card test-runs-card"><div className="ops-card-head"><div><p className="ops-section-kicker">Run history</p><h2>{loading ? "Loading test runs" : `${data.runs?.length || 0} controlled runs`}</h2></div><span>Notifications and provider calls suppressed</span></div>
        {(data.runs || []).map((run) => <article className="test-run" key={run._id}><div className="test-run-main"><strong>{run.testRun?.runId}</strong><h3>{run.scenarioLabel}</h3><p>{run.customer?.fullName} · {run.reference}</p><div className="test-progress"><i style={{ width: `${run.progress || 0}%` }} /></div><small>{run.completed ? "Complete" : `Next: ${run.nextStep?.label || "Ready"}`} · {run.testRun?.completedSteps?.length || 0} checkpoints recorded</small></div><div className="test-run-actions"><button className="ops-button secondary" type="button" disabled={Boolean(working)} onClick={() => advance(run._id, false)}><FiPlay /> Next</button><button className="ops-button primary" type="button" disabled={Boolean(working) || run.completed} onClick={() => advance(run._id, true)}>Run full scenario</button><button className="test-delete" type="button" disabled={Boolean(working)} onClick={() => removeRun(run._id)} aria-label="Remove test run"><FiTrash2 /></button></div></article>)}
        {!loading && (data.runs || []).length === 0 && <div className="test-empty"><h3>No controlled runs yet</h3><p>Create a scenario above when you are ready to verify the complete workflow.</p></div>}
      </section>
    </AdminLayout>
  );
}

export default AdminTestCentre;
