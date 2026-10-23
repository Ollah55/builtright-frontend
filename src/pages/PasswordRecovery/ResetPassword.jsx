import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import "./passwordRecovery.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

export default function ResetPassword() {
  const location = useLocation();
  const [params] = useSearchParams();
  const isAdmin = location.pathname.startsWith("/admin/");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginPath, setLoginPath] = useState(isAdmin ? "/admin/login" : "/auth");

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) return setMessage("Passwords do not match.");
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}${isAdmin ? "/api/admin/reset-password" : "/api/auth/reset-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.get("token"), password }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not reset the password.");
      setLoginPath(data.loginPath || (isAdmin ? "/admin/login" : "/auth"));
      setMessage(data.message);
      setDone(true);
    } catch (error) {
      setMessage(error.message || "Could not reset the password.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="password-recovery-page"><Helmet><title>Reset Password | BuiltRight</title></Helmet><section className="password-recovery-card">
    <p className="password-recovery-kicker">BuiltRight secure access</p><h1>Set a new password</h1><p>This secure link expires after one hour. Use at least 12 characters.</p>
    {done ? <Link className="password-recovery-primary-link" to={loginPath}>Continue to sign in</Link> : <form onSubmit={submit}><label>New password<PasswordInput minLength="12" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><label>Confirm password<PasswordInput minLength="12" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? "Updating..." : "Set new password"}</button></form>}
    {message && <p className="password-recovery-message" role="status">{message}</p>}
  </section></main>;
}
