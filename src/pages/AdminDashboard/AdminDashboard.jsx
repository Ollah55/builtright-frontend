import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import CountUp from "react-countup";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminDashboard.css";

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value || 0);
    const duration = 900;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return displayValue.toLocaleString();
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalLoanRequests: 0,
    totalCustomers: 0,
    pendingLoanRequests: 0,
    approvedLoans: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
          "https://builtright-backend.onrender.com/api/admin/dashboard-stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("LOAD ADMIN STATS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      note: "Marketplace inventory",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: "🧾",
      note: "Customer purchases",
    },
    {
      label: "Loan Requests",
      value: stats.totalLoanRequests,
      icon: "💳",
      note: "Financing pipeline",
    },
    {
      label: "Customers",
      value: stats.totalCustomers,
      icon: "👥",
      note: "Registered users",
    },
    {
      label: "Pending Loans",
      value: stats.pendingLoanRequests,
      icon: "⏳",
      note: "Needs review",
    },
    {
      label: "Approved Loans",
      value: stats.approvedLoans,
      icon: "✅",
      note: "Approved financing",
    },
  ];

  const approvalRate =
    stats.totalLoanRequests > 0
      ? Math.min(100, (stats.approvedLoans / stats.totalLoanRequests) * 100)
      : 0;

  return (
    <AdminLayout
      title="Operations Overview"
      subtitle="Manage products, orders, customers, and financing activity from one secure BuiltRight control center."
    >
      <section className="admin-dashboard-hero-actions">
        <button type="button" onClick={() => navigate("/admin/products")}>
          Add / Manage Products
        </button>

        <button
          type="button"
          className="secondary"
          onClick={() => navigate("/admin/loan-requests")}
        >
          Review Loans
        </button>
      </section>

      {loading ? (
        <section className="admin-panel">
          <h2>Loading dashboard...</h2>
          <p>Please wait while we load your business data.</p>
        </section>
      ) : (
        <>
          <section className="admin-cards">
            {statCards.map((card) => (
              <div className="admin-card" key={card.label}>
                <div className="admin-card-icon">{card.icon}</div>

                <div>
                  <span>{card.label}</span>
                  <h3>
                    <AnimatedNumber value={card.value} />
                  </h3>
                  <p>{card.note}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-grid-panels">
            <div className="admin-panel admin-action-panel">
              <div>
                <p className="admin-eyebrow">Quick Actions</p>
                <h2>Run daily operations faster</h2>
              </div>

              <div className="quick-actions">
                <button onClick={() => navigate("/admin/products")}>
                  Manage Products
                </button>

                <button onClick={() => navigate("/admin/orders")}>
                  View Orders
                </button>

                <button onClick={() => navigate("/admin/loan-requests")}>
                  Financing Requests
                </button>

                <button onClick={() => navigate("/admin/customers")}>
                  Customers
                </button>
              </div>
            </div>

            <div className="admin-panel admin-pipeline-panel">
              <p className="admin-eyebrow">Financing Pipeline</p>
              <h2>Loan request health</h2>

              <div className="pipeline-row">
                <span>Pending Review</span>
                 <AnimatedNumber value={stats.pendingLoanRequests} /> 
              </div>

              <div className="pipeline-row">
                <span>Approved Loans</span>
                <strong>
                  <AnimatedNumber value={stats.approvedLoans} />
                </strong>
              </div>

              <div className="pipeline-meter">
                <div style={{ width: `${approvalRate}%` }}></div>
              </div>

              <p>
                Approval progress across all financing requests currently
                recorded in the system.
              </p>
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-eyebrow">System Status</p>
            <h2>BuiltRight control center is active</h2>
            <p>
              Your admin workspace is connected to product inventory, customers,
              orders, and financing requests.
            </p>
          </section>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;