import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./adminLayout.css";

function AdminLayout({
  children,
  title = "Dashboard",
  subtitle = "Manage BuiltRight operations",
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("builtright_admin_token");
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="admin-mobile-overlay" onClick={closeSidebar}></div>
      )}

      <aside
        className={`admin-layout-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div className="admin-layout-brand">
          <div className="admin-layout-logo">BR</div>

          <div>
            <h2>BuiltRight</h2>
            <p>Admin Console</p>
          </div>
        </div>

        <nav className="admin-layout-nav">
          <NavLink to="/admin/dashboard" onClick={closeSidebar}>Overview</NavLink>
          <NavLink to="/admin/products" onClick={closeSidebar}>Products</NavLink>
          <NavLink to="/admin/orders" onClick={closeSidebar}>Orders</NavLink>
          <NavLink to="/admin/loan-requests" onClick={closeSidebar}>Loan Requests</NavLink>
          <NavLink to="/admin/customers" onClick={closeSidebar}>Customers</NavLink>
        </nav>

        <div className="admin-layout-sidebar-footer">
          <p>Secure internal workspace</p>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="admin-layout-main">
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <div className="admin-layout-topbar">
          <div>
            <p className="admin-layout-eyebrow">BuiltRight Admin</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
        </div>

        <div className="admin-layout-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;