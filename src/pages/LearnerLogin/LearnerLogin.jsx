import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import "./learnerAccess.css";
import { readLearnerApiResponse } from "../../services/learnerApi";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function LearnerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/learner/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await readLearnerApiResponse(response, "Could not sign in.");
      localStorage.setItem("learnerToken", data.token);
      localStorage.setItem("learnerUser", JSON.stringify(data.user));
      navigate(location.state?.from || "/learner/portal");
    } catch (error) { setMessage(error.message || "Could not sign in."); } finally { setSubmitting(false); }
  };

  return <main className="learner-access-page"><Helmet><title>Learner Login | BuiltRight Training</title></Helmet><section className="learner-access-card"><p className="learner-eyebrow">BuiltRight virtual training</p><h1>Learner portal</h1><p>Sign in to view your cohort curriculum, download the brochure, and join live solar installation classes.</p><form onSubmit={submit}><label>Email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required /></label><button type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Sign in to learner portal"}</button></form>{message && <p className="learner-access-message">{message}</p>}</section></main>;
}

export default LearnerLogin;
