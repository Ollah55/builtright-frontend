import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import "../InstallerLogin/installerAccess.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function SalesLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/sales/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not sign in.");
      localStorage.setItem("salesToken", data.token);
      localStorage.setItem("salesUser", JSON.stringify(data.user));
      navigate(location.state?.from || "/sales/projects");
    } catch (error) { setMessage(error.message); } finally { setSubmitting(false); }
  };
  return <main className="installer-access-page"><Helmet><title>Sales Login | BuiltRight</title></Helmet><section className="installer-access-card"><p className="installer-eyebrow">BuiltRight sales operations</p><h1>Sales team login</h1><p>Register direct and WhatsApp customers, capture load audits, assign installers, and prepare quotations.</p><form onSubmit={submit}><label>Email<input type="email" required value={form.email} onChange={(event)=>setForm({...form,email:event.target.value})}/></label><label>Password<PasswordInput autoComplete="current-password" required value={form.password} onChange={(event)=>setForm({...form,password:event.target.value})}/></label><button type="submit" disabled={submitting}>{submitting?"Signing in...":"Sign in to sales workspace"}</button></form><Link className="password-help-link" to="/forgot-password?role=sales">Forgot password?</Link>{message&&<p className="installer-access-message">{message}</p>}</section></main>;
}

export default SalesLogin;
