import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";
import logoooo from "../../assets/logoooo.png";

function Navbar({ onOpenCart, cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("customerUser"));

  const closeMenu = () => setMenuOpen(false);

  const handleOpenCart = () => {
    closeMenu();
    onOpenCart();
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    closeMenu();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <img src={logoooo} alt="BuiltRight Logo" className="logo-img" />
          </Link>
        </div>

        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>

          <NavLink to="/services" onClick={closeMenu}>
            Services
          </NavLink>

          <NavLink to="/energy" onClick={closeMenu}>
            Energy Solutions
          </NavLink>

          <NavLink to="/shop" onClick={closeMenu}>
            Shop
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>

        <div className="navbar-right">
          {!user ? (
            <button
              type="button"
              className="nav-auth-btn"
              onClick={() => {
                closeMenu();
                navigate("/auth");
              }}
            >
              Login / Sign up
            </button>
          ) : (
            <div className="nav-user">
  <span>Hi, {user.fullName.split(" ")[0]}</span>

  <button
    type="button"
    className="dashboard-btn"
    onClick={() => navigate("/customer/dashboard")}
  >
    Dashboard
  </button>

  <button
    type="button"
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
</div>
          )}

          <button
            type="button"
            className="cart-btn-nav"
            onClick={handleOpenCart}
          >
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;