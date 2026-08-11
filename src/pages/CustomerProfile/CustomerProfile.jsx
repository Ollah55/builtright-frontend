import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout/CustomerLayout";
import "./customerProfile.css";

function CustomerProfile() {
  const savedUser = JSON.parse(localStorage.getItem("customerUser"));

  const [formData, setFormData] = useState({
    fullName: savedUser?.fullName || "",
    email: savedUser?.email || "",
    phone: savedUser?.phone || "",
    location: savedUser?.location || "",
  });

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");

      const token = localStorage.getItem("customerToken");

      const response = await fetch("https://builtright-backend.onrender.com/api/customer/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to update profile.");
      }

      localStorage.setItem("customerUser", JSON.stringify(data.user));
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomerLayout>
      <main className="customer-profile-main">
        <div className="customer-profile-topbar">
          <div>
            <p>Customer Dashboard</p>
            <h1>My Profile</h1>
          </div>
        </div>

        {message && <p className="customer-profile-message">{message}</p>}

        <section className="customer-profile-documents">
          <div>
            <span>Project documents</span>
            <h2>Quotations and invoices</h2>
            <p>Review the full project cost, approve your quotation, and download every issued document from your account.</p>
          </div>
          <Link to="/customer/documents">Open documents</Link>
        </section>

        <section className="customer-profile-panel">
          <div className="customer-profile-head">
            <h2>Account Information</h2>
            <p>Update your contact details and location information.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="customer-profile-form">
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Ikeja, Lagos"
                />
              </div>
            </div>

            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>
      </main>
    </CustomerLayout>
  );
}

export default CustomerProfile;
