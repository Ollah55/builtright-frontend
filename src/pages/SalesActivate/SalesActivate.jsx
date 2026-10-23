import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import "../InstallerLogin/installerAccess.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function SalesActivate() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setMessage("Passwords do not match.");
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/activate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), password }) });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not activate account.");
      setSuccess(true); setMessage(data.message);
    } catch (error) { setMessage(error.message); }
  };
  return <main className="installer-access-page"><section className="installer-access-card"><p className="installer-eyebrow">BuiltRight sales operations</p><h1>Activate sales account</h1><p>Create the password you will use for the sales workspace.</p>{success?<Link className="installer-access-link" to="/sales/login">Go to sales login</Link>:<form onSubmit={submit}><label>New password<PasswordInput minLength="8" autoComplete="new-password" required value={password} onChange={(event)=>setPassword(event.target.value)}/></label><label>Confirm password<PasswordInput minLength="8" autoComplete="new-password" required value={confirm} onChange={(event)=>setConfirm(event.target.value)}/></label><button type="submit">Activate sales account</button></form>}{message&&<p className={`installer-access-message ${success?"success":""}`}>{message}</p>}</section></main>;
}

export default SalesActivate;
