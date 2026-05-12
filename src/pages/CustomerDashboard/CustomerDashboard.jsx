import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./customerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("customerUser"));

  const firstName = user?.fullName?.split(" ")[0] || "Customer";
  const token = localStorage.getItem("customerToken");

  const [orders, setOrders] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ordersResponse, loansResponse] = await Promise.all([
          fetch("https://builtright-backend.onrender.com/api/customer/orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("https://builtright-backend.onrender.com/api/customer/loan-requests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const ordersData = await ordersResponse.json();
        const loansData = await loansResponse.json();

        if (ordersData.status) {
          setOrders(ordersData.orders || []);
        }

        if (loansData.status) {
          setLoanRequests(loansData.loanRequests || []);
        }
      } catch (error) {
        console.error("CUSTOMER DASHBOARD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    navigate("/auth");
  };

  const latestOrder = orders[0];
  const latestLoan = loanRequests[0];

  return (
    <div className="customer-dashboard">
      <aside className="customer-sidebar">
        <div>
          <h2>BuiltRight</h2>

          <div className="customer-user-box">
            <div className="customer-avatar">{firstName.charAt(0)}</div>

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

      <main className="customer-main">
        <div className="customer-hero">
          <div>
            <p className="customer-small-label">Customer Dashboard</p>

            <h1>
              Welcome back, <span>{firstName}</span>
            </h1>

            <p className="customer-hero-text">
              Manage your solar orders, financing applications, account
              information, and BuiltRight activity from one secure dashboard.
            </p>
          </div>

          <button
            type="button"
            className="customer-shop-btn"
            onClick={() => navigate("/shop")}
          >
            Continue Shopping
          </button>
        </div>

        <div className="customer-cards">
          <div className="customer-card">
            <div>
              <span>Total Orders</span>
              <h3>{loading ? "..." : orders.length}</h3>
            </div>

            <div className="customer-card-icon">📦</div>
          </div>

          <div className="customer-card">
            <div>
              <span>Financing Requests</span>
              <h3>{loading ? "..." : loanRequests.length}</h3>
            </div>

            <div className="customer-card-icon">💳</div>
          </div>

          <div className="customer-card">
            <div>
              <span>Account Status</span>
              <h3>Active</h3>
            </div>

            <div className="customer-card-icon">✅</div>
          </div>
        </div>

        <div className="customer-grid">
          <section className="customer-panel">
            <div className="customer-panel-head">
              <div>
                <p>Profile Overview</p>
                <h2>Account Information</h2>
              </div>
            </div>

            <div className="customer-profile-grid">
              <div className="customer-profile-item">
                <span>Full Name</span>
                <strong>{user?.fullName}</strong>
              </div>

              <div className="customer-profile-item">
                <span>Email Address</span>
                <strong>{user?.email}</strong>
              </div>

              <div className="customer-profile-item">
                <span>Phone Number</span>
                <strong>{user?.phone}</strong>
              </div>

              <div className="customer-profile-item">
                <span>Location</span>
                <strong>{user?.location || "Not provided"}</strong>
              </div>
            </div>
          </section>

          <section className="customer-panel">
            <div className="customer-panel-head">
              <div>
                <p>Recent Activity</p>
                <h2>Latest Updates</h2>
              </div>
            </div>

            <div className="customer-activity-list">
              <div className="customer-activity-item">
                <div className="activity-dot green"></div>
                <div>
                  <strong>Account Active</strong>
                  <p>Your BuiltRight account is active and secure.</p>
                </div>
              </div>

              <div className="customer-activity-item">
                <div className="activity-dot"></div>
                <div>
                  <strong>Latest Order</strong>
                  <p>
                    {latestOrder
                      ? `${latestOrder.orderNumber || "Order"} is currently ${
                          latestOrder.status || "being processed"
                        }.`
                      : "No orders yet. Browse products to place your first order."}
                  </p>
                </div>
              </div>

              <div className="customer-activity-item">
                <div className="activity-dot red"></div>
                <div>
                  <strong>Latest Financing</strong>
                  <p>
                    {latestLoan
                      ? `Your latest financing request is ${latestLoan.status}.`
                      : "No financing requests yet. You can apply from the shop or financing page."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CustomerDashboard;