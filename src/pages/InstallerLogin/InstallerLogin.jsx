import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import "./installerAccess.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function InstallerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/installer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not sign in.");
      localStorage.setItem("installerToken", data.token);
      localStorage.setItem("installerUser", JSON.stringify(data.user));
      navigate(location.state?.from || "/installer/assignments");
    } catch (error) {
      setMessage(error.message || "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="installer-access-page">
      <Helmet><title>Installer Login | BuiltRight</title></Helmet>
      <section className="installer-access-card">
        <p className="installer-eyebrow">BuiltRight field operations</p>
        <h1>Installer profile</h1>
        <p>Sign in to review inspection assignments, contact customers, schedule visits, and submit assessment reports.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required /></label>
          <button type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Sign in to installer profile"}</button>
        </form>
        {message && <p className="installer-access-message">{message}</p>}
      </section>
    </main>
  );
}

export default InstallerLogin;
