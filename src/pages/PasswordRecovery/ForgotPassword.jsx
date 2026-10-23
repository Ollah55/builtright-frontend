import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "./passwordRecovery.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const roleDetails = {
  customer: { label: "customer", login: "/auth" },
  installer: { label: "installer", login: "/installer/login" },
  learner: { label: "learner", login: "/learner/login" },
  sales: { label: "sales team", login: "/sales/login" },
  accountant: { label: "accountant", login: "/accounting/login" },
};

export default function ForgotPassword() {
  const location = useLocation();
  const [params] = useSearchParams();
  const isAdmin = location.pathname.startsWith("/admin/");
  const requestedRole = params.get("role") || "customer";
  const role = roleDetails[requestedRole] ? requestedRole : "customer";
  const details = isAdmin ? { label: "administrator", login: "/admin/login" } : roleDetails[role];
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}${isAdmin ? "/api/admin/forgot-password" : "/api/auth/forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isAdmin ? { email } : { email, role }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not request a password reset.");
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message || "Could not request a password reset.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="password-recovery-page"><Helmet><title>Forgot Password | BuiltRight</title></Helmet><section className="password-recovery-card">
    <p className="password-recovery-kicker">BuiltRight secure access</p>
    <h1>Forgot your password?</h1>
    <p>Enter the email connected to your {details.label} account. We will send a secure link that expires after one hour.</p>
    <form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button type="submit" disabled={busy}>{busy ? "Sending..." : "Send reset link"}</button></form>
    {message && <p className="password-recovery-message" role="status">{message}</p>}
    <Link className="password-help-link" to={details.login}>Back to sign in</Link>
  </section></main>;
}
