import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import "./adminlogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setStatusMessage("");

      const response = await fetch("https://builtright-backend-1.onrender.com/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("builtright_admin_token", data.token);

      navigate("/admin/dashboard");
    } catch (error) {
      setStatusMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <Helmet>
        <title>Admin Login | BuiltRight</title>
      </Helmet>

      <div className="admin-login-bg-glow glow-one"></div>
      <div className="admin-login-bg-glow glow-two"></div>

      <section className="admin-login-shell">
        <div className="admin-login-visual">
          <div className="visual-overlay"></div>

          <div className="admin-brand">
            <span>BuiltRight Admin</span>
            <h1>Operations Control Center</h1>
            <p>
              Manage solar products, customer orders, financing requests, and
              business operations from one secure workspace.
            </p>
          </div>

          <div className="admin-visual-stats">
            <div>
              <strong>Solar</strong>
              <span>Marketplace</span>
            </div>

            <div>
              <strong>Loan</strong>
              <span>Requests</span>
            </div>

            <div>
              <strong>Orders</strong>
              <span>Tracking</span>
            </div>
          </div>
        </div>

        <div className="admin-login-panel">
          <div className="admin-login-card">
            <p className="admin-eyebrow">Secure Access</p>
            <h2>Welcome Back</h2>
            <p className="admin-login-copy">
              Sign in to access the BuiltRight internal dashboard.
            </p>

            <form onSubmit={handleSubmit}>
              <label>
                Admin Email
                <input
                  type="email"
                  name="email"
                  placeholder="admin@builtrightltd.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Login to Dashboard"}
              </button>

              {statusMessage && (
                <p className="admin-login-status">{statusMessage}</p>
              )}
            </form>

            <div className="admin-security-note">
              <span>Protected Area</span>
              <p>Access is restricted to authorized BuiltRight personnel only.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;
