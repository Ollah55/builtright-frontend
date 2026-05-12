import React from "react";
import "./footer.css";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-col">
          <h3 className="footer-logo">BuiltRight</h3>
          <p className="footer-text">
            Member of relevant UK/Nigeria Facility Management Associations.
            </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/energy">Energy Solutions</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* SERVICES */}
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li>Facility Management</li>
            <li>Energy Solutions</li>
            <li>Cost Optimisation</li>
            <li>Maintenance Services</li>
            <li>Technical Training</li>
          </ul>
        </div>

        {/* CONTACT */}
       <div className="footer-col">
  <h4>Contact</h4>

  <p>📍 1b Adeniji Street, Off Odusami Street, Ogba, Lagos</p>
  <p>📞 +234 913 499 1239</p>
  <p>📞 +234 701 574 9737</p>
  <p>✉️ info@builtrightltd.com</p>

  

  {/* SOCIALS */}
 <div className="footer-socials">
  <a href="#" target="_blank" rel="noopener noreferrer">
    <FaFacebookF size={18} />
  </a>
  <a href="#" target="_blank" rel="noopener noreferrer">
    <FaInstagram size={18} />
  </a>
  <a href="#" target="_blank" rel="noopener noreferrer">
    <FaTwitter size={18} />
  </a>
</div>
</div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} BuiltRight Services Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;