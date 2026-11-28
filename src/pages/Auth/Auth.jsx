import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiCreditCard, FiHome, FiShield, FiSun } from "react-icons/fi";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import "./auth.css";

const emptyLogin = { email: "", password: "" };

function Auth() {
  const location = useLocation();
  const requestedPath = location.state?.from || "";
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState(emptyLogin);
  const [loginFormVersion, setLoginFormVersion] = useState(0);

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
    serviceInterest: requestedPath.startsWith("/customer/maintenance") ? "maintenance" : "",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const onPageShow = (event) => {
      if (!event.persisted) return;
      setLoginData(emptyLogin);
      setLoginFormVersion((version) => version + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const switchMode = (register) => {
    setLoginData(emptyLogin);
    setRegisterData((current) => ({ ...current, password: "", confirmPassword: "" }));
    setMessage("");
    setIsRegister(register);
  };

  const saveAuth = (data) => {
    localStorage.setItem("customerToken", data.token);
    localStorage.setItem("customerUser", JSON.stringify(data.user));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");

      const response = await fetch("https://builtright-backend-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Login failed.");
      }

      saveAuth(data);
      setLoginData(emptyLogin);
      navigate(requestedPath || data.nextPath || "/customer/dashboard");
    } catch (error) {
      setMessage(error.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const response = await fetch("https://builtright-backend-1.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: registerData.fullName,
          email: registerData.email,
          phone: registerData.phone,
          location: registerData.location,
          password: registerData.password,
          serviceInterest: registerData.serviceInterest,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Registration failed.");
      }

      saveAuth(data);
      navigate(requestedPath || data.nextPath || (registerData.serviceInterest === "maintenance" ? "/customer/maintenance" : "/customer/dashboard"));
    } catch (error) {
      setMessage(error.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>{isRegister ? "Create Account" : "Login"} | BuiltRight</title>
        <meta
          name="description"
          content="Login or create a BuiltRight customer account for solar financing or facility maintenance services."
        />
      </Helmet>

      <section className="auth-shell">
        <div className="auth-info">
          <p className="section-label">BuiltRight Account</p>
          <h1>One secure account for energy and facility care.</h1>
          <p>
            Choose the service you need when signing up. Your account will open
            the correct portal for solar financing or facility maintenance.
          </p>

          <div className="auth-benefits">
            <span><FiSun /> Solar & financing</span>
            <span><FiHome /> Facility maintenance</span>
            <span><FiShield /> One secure login</span>
          </div>
        </div>

        <div className={`auth-card-wrap ${isRegister ? "flipped" : ""}`}>
          <div className="auth-card">
            <div className="auth-face auth-front" inert={isRegister}>
              <h2>Welcome Back</h2>
              <p>Use your customer email and password. We will open the service connected to your account.</p>

              {!isRegister && <form key={loginFormVersion} autoComplete="off" onSubmit={handleLogin}>
                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  aria-label="Email address"
                  placeholder="Email Address"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />

                <PasswordInput
                  name="password"
                  autoComplete="off"
                  aria-label="Password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </form>}
              <Link className="password-help-link" to="/forgot-password?role=customer">Forgot password?</Link>

              <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <button type="button" disabled={isSubmitting} onClick={() => switchMode(true)}>
                  Register
                </button>
              </p>

              {message && !isRegister && <p className="auth-message">{message}</p>}
            </div>

            <div className="auth-face auth-back" inert={!isRegister}>
              <h2>Create Account</h2>
              <p>First, choose the BuiltRight service you want to access.</p>

              {isRegister && <form onSubmit={handleRegister}>
                <fieldset className="auth-service-choice">
                  <legend>What do you need?</legend>
                  <button
                    type="button"
                    className={registerData.serviceInterest === "financing" ? "selected" : ""}
                    onClick={() => setRegisterData((current) => ({ ...current, serviceInterest: "financing" }))}
                    aria-pressed={registerData.serviceInterest === "financing"}
                  >
                    <span><FiCreditCard /></span>
                    <div><strong>Solar & Financing</strong><small>Solar products, quotations, bank application and installation tracking</small></div>
                  </button>
                  <button
                    type="button"
                    className={registerData.serviceInterest === "maintenance" ? "selected" : ""}
                    onClick={() => setRegisterData((current) => ({ ...current, serviceInterest: "maintenance" }))}
                    aria-pressed={registerData.serviceInterest === "maintenance"}
                  >
                    <span><FiHome /></span>
                    <div><strong>Facility Maintenance</strong><small>Inspection, due diligence, maintenance plan and emergency support</small></div>
                  </button>
                  <input type="hidden" name="serviceInterest" value={registerData.serviceInterest} required />
                </fieldset>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  required
                />

                <input
                  type="text"
                  name="location"
                  placeholder={registerData.serviceInterest === "maintenance" ? "Property Location / Area" : "Location"}
                  value={registerData.location}
                  onChange={handleRegisterChange}
                />

                <div className="auth-row">
                  <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />

                  <PasswordInput
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <button type="submit" disabled={isSubmitting || !registerData.serviceInterest}>
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </form>}

              <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" disabled={isSubmitting} onClick={() => switchMode(false)}>
                  Login
                </button>
              </p>

              {message && isRegister && <p className="auth-message">{message}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Auth;
