import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { accountingApi } from "../../services/accountingApi";
import "./accounting.css";
import "./accountingForms.css";

export default function AccountantLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const data = await accountingApi("/accounting/login", { method: "POST", body: form });
      localStorage.setItem("accountantToken", data.token);
      localStorage.setItem("accountantUser", JSON.stringify(data.user));
      navigate(location.state?.from || "/accounting/dashboard", { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="acct-access"><Helmet><title>Accountant Login | BuiltRight</title></Helmet><section className="acct-access-card">
    <p className="acct-kicker">BuiltRight Services Limited</p><h1>Accounting portal</h1><p>Secure access for the designated company accountant.</p>
    <form onSubmit={submit}><label>Email<input type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Password<span className="acct-password-row"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" className="acct-password-toggle" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></span></label><button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>
    {error && <p className="acct-error" role="alert">{error}</p>}<p className="acct-help">Forgot your password? Ask a BuiltRight administrator to send you a secure reset link.</p><Link to="/">Back to website</Link>
  </section></main>;
}
