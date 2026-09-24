import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { accountingApi, naira } from "../../services/accountingApi";
import "./accounting.css";
import "./fixedAssets.css";

const emptySummary = {
  activeAccounts: 0,
  fixedAssets: 0,
  fixedAssetCostKobo: 0,
  postedJournals: 0,
  draftJournals: 0,
  totalRevenueKobo: 0,
  totalExpenseKobo: 0,
  netProfitKobo: 0,
  totalAssetsKobo: 0,
  totalLiabilitiesKobo: 0,
  totalEquityKobo: 0,
  balanceSheetDifferenceKobo: 0,
  trialBalanceDebitKobo: 0,
  trialBalanceCreditKobo: 0,
  trialBalanceBalanced: false,
};

export default function AdminAccountant() {
  const [accounts, setAccounts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [summary, setSummary] = useState(emptySummary);
  const [recentJournals, setRecentJournals] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await accountingApi("/admin/accountant", { admin: true });
      setAccounts(data.accountants || []);
      setStartDate(data.startDate || "");
      setSummary(data.summary || emptySummary);
      setRecentJournals(data.recentJournals || []);
    } catch (err) {
      setMessage(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const data = await accountingApi("/admin/accountant/invite", {
        admin: true,
        method: "POST",
        body: form,
      });
      setMessage(data.message);
      setForm({ fullName: "", email: "" });
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (person) => {
    if (
      !window.confirm(
        `Revoke ${person.fullName}'s accountant access? Existing accounting records will stay intact.`,
      )
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      const data = await accountingApi(
        `/admin/accountant/${person.id}/revoke`,
        { admin: true, method: "PATCH" },
      );
      setMessage(data.message);
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sendPasswordReset = async (person) => {
    if (!window.confirm(`Send a password reset link to ${person.email}?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const data = await accountingApi(
        `/admin/accountant/${person.id}/password-reset`,
        { admin: true, method: "POST" },
      );
      setMessage(data.message);
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const active = accounts.find((person) => person.isActive);
  const pending = accounts.find(
    (person) =>
      !person.isActive &&
      !person.activatedAt &&
      person.invitationExpiresAt &&
      new Date(person.invitationExpiresAt) > new Date(),
  );

  return (
    <AdminLayout
      title="Accounting overview"
      subtitle="Company financial summary and accountant access"
    >
      {message && <p className="acct-message">{message}</p>}

      <div className="acct-stats">
        <article><span>Total assets</span><strong>{naira(summary.totalAssetsKobo)}</strong></article>
        <article><span>Total liabilities</span><strong>{naira(summary.totalLiabilitiesKobo)}</strong></article>
        <article><span>Total equity</span><strong>{naira(summary.totalEquityKobo)}</strong></article>
        <article><span>Net profit / loss</span><strong>{naira(summary.netProfitKobo)}</strong></article>
        <article><span>Revenue</span><strong>{naira(summary.totalRevenueKobo)}</strong></article>
        <article><span>Expenses</span><strong>{naira(summary.totalExpenseKobo)}</strong></article>
        <article><span>Fixed assets</span><strong>{summary.fixedAssets}</strong><small>{naira(summary.fixedAssetCostKobo)}</small></article>
        <article><span>Posted / draft journals</span><strong>{summary.postedJournals} / {summary.draftJournals}</strong></article>
      </div>

      <div className="acct-admin-grid">
        <section className="acct-panel">
          <h2>Accounting checks</h2>
          <p className="acct-total-line"><span>Trial balance debits</span><strong>{naira(summary.trialBalanceDebitKobo)}</strong></p>
          <p className="acct-total-line"><span>Trial balance credits</span><strong>{naira(summary.trialBalanceCreditKobo)}</strong></p>
          <p className="acct-total-line"><span>Trial balance</span><strong className={summary.trialBalanceBalanced ? "acct-good" : "acct-error"}>{summary.trialBalanceBalanced ? "Balanced" : "Out of balance"}</strong></p>
          <p className="acct-total-line"><span>Balance-sheet difference</span><strong className={summary.balanceSheetDifferenceKobo === 0 ? "acct-good" : "acct-error"}>{naira(summary.balanceSheetDifferenceKobo)}</strong></p>
          <p className="acct-note">Accounting period starts {startDate || "—"}. Opening fixed-asset balances from the company workbook are included.</p>
        </section>

        <section className="acct-panel">
          <h2>{active ? "Current accountant" : "Invite an accountant"}</h2>
          {active ? <>
            <p><strong>{active.fullName}</strong><br />{active.email}</p>
            <p><Link to="/accounting/login">Open accountant login →</Link></p>
            {active.passwordResetSentAt && <p className="acct-note">Last password reset link sent {new Date(active.passwordResetSentAt).toLocaleString("en-NG")}.</p>}
            <div className="acct-row-actions">
              <button type="button" className="acct-outline" disabled={busy} onClick={() => sendPasswordReset(active)}>Send password reset link</button>
              <button type="button" className="acct-danger" disabled={busy} onClick={() => revoke(active)}>Revoke access</button>
            </div>
          </> : <>
            <form onSubmit={invite}>
              <label>Full name<input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></label>
              <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
              <button disabled={busy}>{busy ? "Sending…" : pending && pending.email === form.email.toLowerCase() ? "Resend invitation" : "Send invitation"}</button>
            </form>
            {pending && <p>Pending invitation: {pending.fullName} ({pending.email}). Enter the same email to resend, or <button type="button" className="acct-text-button" onClick={() => revoke(pending)}>revoke the pending invitation</button>.</p>}
          </>}
        </section>
      </div>

      <section className="acct-panel">
        <div className="acct-panel-title"><h2>Recent journal activity</h2><button type="button" className="acct-outline" onClick={load}>Refresh</button></div>
        <div className="acct-table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {recentJournals.map((journal) => <tr key={journal.id}>
                <td>{new Date(journal.date).toISOString().slice(0, 10)}</td>
                <td>{journal.reference}</td>
                <td>{journal.description}{journal.reversalOf && <small> · reversal</small>}{journal.amends && <small> · correction</small>}</td>
                <td>{journal.status}</td>
                <td>{naira(journal.debitKobo)}</td>
              </tr>)}
              {!recentJournals.length && <tr><td colSpan="5">No journal activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="acct-note">Admin access is read-only for accounting records. Jennifer manages journal entries, corrections, fixed assets and downloadable statements from the accountant portal.</p>
      </section>
    </AdminLayout>
  );
}
