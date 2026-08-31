import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import "../LearnerLogin/learnerAccess.css";
import { readLearnerApiResponse } from "../../services/learnerApi";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function LearnerActivate() {
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
      setSubmitting(true); setMessage("");
      const response = await fetch(`${API_BASE_URL}/api/learner/activate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), password }) });
      const data = await readLearnerApiResponse(response, "Could not activate account.");
      setSuccess(true); setMessage(data.message);
    } catch (error) { setMessage(error.message || "Could not activate account."); } finally { setSubmitting(false); }
  };

  return <main className="learner-access-page"><Helmet><title>Activate Learner Account | BuiltRight Training</title></Helmet><section className="learner-access-card"><p className="learner-eyebrow">BuiltRight virtual training</p><h1>Set your password</h1><p>Activate your learner account to access the current virtual training cohort. This invitation is valid for seven days.</p>{success ? <Link className="learner-access-link" to="/learner/login">Go to learner login</Link> : <form onSubmit={submit}><label>New password<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><label>Confirm password<input type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label><button type="submit" disabled={submitting}>{submitting ? "Activating..." : "Activate learner account"}</button></form>}{message && <p className={`learner-access-message ${success ? "success" : ""}`}>{message}</p>}</section></main>;
}

export default LearnerActivate;
