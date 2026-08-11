import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import "../InstallerLogin/installerAccess.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function InstallerActivate() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) return setMessage("Passwords do not match.");
    try {
      setSubmitting(true);
      setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/installer/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.get("token"), password }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not activate account.");
      setSuccess(true);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message || "Could not activate account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="installer-access-page">
      <Helmet><title>Activate Installer Account | BuiltRight</title></Helmet>
      <section className="installer-access-card">
        <p className="installer-eyebrow">BuiltRight field operations</p>
        <h1>Activate your account</h1>
        <p>Choose a secure password for your installer profile. This invitation is valid for seven days.</p>
        {success ? <Link className="installer-access-link" to="/installer/login">Go to installer login</Link> : <form onSubmit={submit}>
          <label>New password<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <label>Confirm password<input type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
          <button type="submit" disabled={submitting}>{submitting ? "Activating..." : "Activate installer account"}</button>
        </form>}
        {message && <p className={`installer-access-message ${success ? "success" : ""}`}>{message}</p>}
      </section>
    </main>
  );
}

export default InstallerActivate;
