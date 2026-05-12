import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./customerLayout.css";

function CustomerLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("customerUser"));
  const firstName = user?.fullName?.split(" ")[0] || "Customer";

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    navigate("/auth");
  };

  return (
    <div className="customer-layout">
      <aside className="customer-layout-sidebar">
        <div>
          <h2>BuiltRight</h2>

          <div className="customer-layout-user">
            <div className="customer-layout-avatar">{firstName.charAt(0)}</div>
            <div>
              <h3>{firstName}</h3>
              <p>Customer Account</p>
            </div>
          </div>

          <nav>
            <NavLink to="/customer/dashboard">Overview</NavLink>
            <NavLink to="/customer/orders">My Orders</NavLink>
            <NavLink to="/customer/financing">My Financing</NavLink>
            <NavLink to="/customer/profile">Profile</NavLink>
          </nav>
        </div>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="customer-layout-main">{children}</main>
    </div>
  );
}

export default CustomerLayout;