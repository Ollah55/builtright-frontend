import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiBox,
  FiChevronRight,
  FiCpu,
  FiCreditCard,
  FiGrid,
  FiLink,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiTool,
  FiZap,
  FiUsers,
  FiX,
} from "react-icons/fi";
import logo from "../../assets/logoooo.png";
import "./adminLayout.css";

const navGroups = [
  {
    label: "Operations",
    items: [
      { to: "/admin/dashboard", label: "Overview", icon: FiGrid },
      { to: "/admin/loan-requests", label: "Financing", icon: FiCreditCard },
      { to: "/admin/projects", label: "Projects", icon: FiTool },
      { to: "/admin/devices", label: "Devices", icon: FiCpu },
      { to: "/admin/installers", label: "Installers", icon: FiTool },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
      { to: "/admin/products", label: "Products", icon: FiBox },
      { to: "/admin/customers", label: "Customers", icon: FiUsers },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/integrations", label: "Integrations", icon: FiLink },
      { to: "/admin/test-centre", label: "Test Centre", icon: FiZap },
    ],
  },
];

function AdminLayout({
  children,
  title = "Dashboard",
  subtitle = "Manage BuiltRight operations",
  actions,
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("builtright_admin_token");
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="ops-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="ops-mobile-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside className={`ops-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="ops-sidebar-head">
          <NavLink to="/admin/dashboard" className="ops-brand" onClick={closeSidebar}>
            <img src={logo} alt="BuiltRight" />
            <div>
              <strong>Operations</strong>
              <span>Control centre</span>
            </div>
          </NavLink>

          <button type="button" className="ops-sidebar-close" onClick={closeSidebar} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <div className="ops-environment-card">
          <span className="ops-live-dot" />
          <div>
            <strong>Integration sandbox</strong>
            <p>Provider connections pending</p>
          </div>
        </div>

        <nav className="ops-nav" aria-label="Admin navigation">
          {navGroups.map((group) => (
            <div className="ops-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} onClick={closeSidebar}>
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                    <FiChevronRight className="ops-nav-chevron" aria-hidden="true" />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="ops-sidebar-footer">
          <div className="ops-admin-avatar">BR</div>
          <div className="ops-admin-meta">
            <strong>BuiltRight Admin</strong>
            <span>Operations team</span>
          </div>
          <button type="button" onClick={handleLogout} aria-label="Log out">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="ops-main">
        <header className="ops-header">
          <button type="button" className="ops-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FiMenu />
          </button>

          <div className={`ops-global-search ${searchOpen ? "is-open" : ""}`}>
            <FiSearch aria-hidden="true" />
            <input type="search" placeholder="Search customer, reference, project or device" aria-label="Search operations" />
          </div>

          <div className="ops-header-actions">
            <button type="button" className="ops-search-toggle" onClick={() => setSearchOpen((value) => !value)} aria-label="Toggle search">
              <FiSearch />
            </button>
            <button type="button" className="ops-notification-button" onClick={() => navigate("/admin/devices")} aria-label="View alerts">
              <FiBell />
              <span>1</span>
            </button>
            <div className="ops-date-chip">
              <span>Today</span>
              <strong>11 Aug 2026</strong>
            </div>
          </div>
        </header>

        <section className="ops-page-heading">
          <div>
            <p className="ops-eyebrow">BuiltRight operations</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
          {actions && <div className="ops-page-actions">{actions}</div>}
        </section>

        <div className="ops-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
