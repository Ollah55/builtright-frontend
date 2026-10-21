import { FiClipboard, FiLogOut, FiPlusCircle } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logoooo.png";
import "./salesLayout.css";

function SalesLayout({ children, title, subtitle, actions }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("salesUser") || "{}");
  const logout = () => {
    localStorage.removeItem("salesToken");
    localStorage.removeItem("salesUser");
    navigate("/sales/login");
  };
  return <div className="sales-shell">
    <aside className="sales-sidebar">
      <div className="sales-brand"><img src={logo} alt="BuiltRight" /><div><strong>Sales operations</strong><span>Customer projects</span></div></div>
      <nav><NavLink to="/sales/projects"><FiClipboard /> Customers</NavLink><a href="#new-customer"><FiPlusCircle /> Register customer</a></nav>
      <div className="sales-user"><div><strong>{user.fullName || "Sales team"}</strong><span>{user.email}</span></div><button type="button" onClick={logout} aria-label="Log out"><FiLogOut /></button></div>
    </aside>
    <main className="sales-main"><header><div><p>BuiltRight sales workspace</p><h1>{title}</h1><span>{subtitle}</span></div>{actions && <div>{actions}</div>}</header>{children}</main>
  </div>;
}

export default SalesLayout;
