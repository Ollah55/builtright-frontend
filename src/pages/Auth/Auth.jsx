import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import "./auth.css";

function Auth() {
  const location = useLocation();
  const redirectTo = location.state?.from || "/customer/dashboard";
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
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
      navigate(redirectTo);
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
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Registration failed.");
      }

      saveAuth(data);
      navigate(redirectTo);
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
          content="Login or create a BuiltRight account to shop, checkout, and request financing."
        />
      </Helmet>

      <section className="auth-shell">
        <div className="auth-info">
          <p className="section-label">BuiltRight Account</p>
          <h1>Shop, compare, checkout, and apply for financing securely.</h1>
          <p>
            Create an account to manage your cart, submit financing requests,
            track orders, and access support from BuiltRight.
          </p>

          <div className="auth-benefits">
            <span>Secure checkout</span>
            <span>Solar financing</span>
            <span>Order tracking</span>
          </div>
        </div>

        <div className={`auth-card-wrap ${isRegister ? "flipped" : ""}`}>
          <div className="auth-card">
            <div className="auth-face auth-front">
              <h2>Welcome Back</h2>
              <p>Login to continue shopping with BuiltRight.</p>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setIsRegister(true)}>
                  Register
                </button>
              </p>

              {message && !isRegister && <p className="auth-message">{message}</p>}
            </div>

            <div className="auth-face auth-back">
              <h2>Create Account</h2>
              <p>Register to checkout or apply for financing.</p>

              <form onSubmit={handleRegister}>
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
                  placeholder="Location"
                  value={registerData.location}
                  onChange={handleRegisterChange}
                />

                <div className="auth-row">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => setIsRegister(false)}>
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
