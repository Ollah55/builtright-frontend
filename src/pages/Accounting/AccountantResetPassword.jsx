import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { accountingApi } from "../../services/accountingApi";
import "./accounting.css";
import "./accountingForms.css";

export default function AccountantResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      await accountingApi("/accounting/reset-password", {
        method: "POST",
        body: { token: params.get("token"), password },
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return <main className="acct-access"><Helmet><title>Reset Accountant Password | BuiltRight</title></Helmet><section className="acct-access-card">
    <p className="acct-kicker">BuiltRight accounting</p><h1>Reset your password</h1><p>The secure link is valid for one hour. Use at least 12 characters.</p>
    {done ? <p>Password updated. <Link to="/accounting/login">Sign in to accounting</Link></p> : <form onSubmit={submit}>
      <label>New password<span className="acct-password-row"><input type={showPassword ? "text" : "password"} minLength="12" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" className="acct-password-toggle" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></span></label>
      <label>Confirm password<input type={showPassword ? "text" : "password"} minLength="12" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></label>
      <button disabled={busy}>{busy ? "Updating…" : "Set new password"}</button>
    </form>}
    {error && <p className="acct-error" role="alert">{error}</p>}
  </section></main>;
}
