import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { accountingApi } from "../../services/accountingApi";
import "./accounting.css";

export default function AccountantActivate() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true); setError("");
    try { await accountingApi("/accounting/activate", { method: "POST", body: { token: params.get("token"), password } }); setDone(true); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="acct-access"><Helmet><title>Activate Accountant Account | BuiltRight</title></Helmet><section className="acct-access-card"><p className="acct-kicker">BuiltRight accounting</p><h1>Set your password</h1><p>This invitation is valid for seven days. Use at least 12 characters.</p>
    {done ? <p>Account activated. <Link to="/accounting/login">Sign in to accounting</Link></p> : <form onSubmit={submit}><label>New password<input type="password" minLength="12" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><label>Confirm password<input type="password" minLength="12" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></label><button disabled={busy}>{busy ? "Activating…" : "Activate account"}</button></form>}
    {error && <p className="acct-error" role="alert">{error}</p>}
  </section></main>;
}
