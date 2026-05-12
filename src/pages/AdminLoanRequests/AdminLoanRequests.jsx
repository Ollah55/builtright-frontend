import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../AdminDashboard/adminDashboard.css";
import "./adminloanrequests.css";

function AdminLoanRequests() {
  const navigate = useNavigate();

  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const loadLoanRequests = async () => {
      try {
        const response = await fetch("https://builtright-backend.onrender.com/api/loan-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.status && Array.isArray(data.loanRequests)) {
          setLoanRequests(data.loanRequests);
        }
      } catch (error) {
        console.error("LOAD LOAN REQUESTS ERROR:", error);
        setMessage("Failed to load loan requests.");
      } finally {
        setLoading(false);
      }
    };

    loadLoanRequests();
  }, [token]);

  const filteredRequests = useMemo(() => {
    let result = [...loanRequests];

    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (request) =>
          request.customer?.fullName?.toLowerCase().includes(search) ||
          request.customer?.email?.toLowerCase().includes(search) ||
          request.customer?.phone?.toLowerCase().includes(search) ||
          request.productSource?.toLowerCase().includes(search) ||
          request.financeInstitution?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [loanRequests, statusFilter, searchTerm]);

  const updateStatus = async (id, status) => {
  try {
    const response = await fetch(
      `https://builtright-backend.onrender.com/api/loan-requests/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Failed to update status.");
    }

    setLoanRequests((prev) =>
      prev.map((request) =>
        request._id === id ? data.loanRequest : request
      )
    );

    setMessage(
      status === "approved"
        ? "Loan approved and order created. Check Admin Orders."
        : "Loan request status updated."
    );
  } catch (error) {
    setMessage(error.message || "Failed to update status.");
  }
};
const deleteLoanRequest = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this loan request?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`https://builtright-backend.onrender.com/api/loan-requests/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();


    if (!response.ok || !data.status) {
      throw new Error(data.message || "Failed to delete loan request.");
    }

    setLoanRequests((prev) => prev.filter((request) => request._id !== id));
    setMessage("Loan request deleted successfully.");
    window.location.reload();
  } catch (error) {
    setMessage(error.message || "Failed to delete loan request.");
  }
};
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>BuiltRight Admin</h2>

        <nav>
          <NavLink to="/admin/dashboard">Overview</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/loan-requests">Loan Requests</NavLink>
          <NavLink to="/admin/customers">Customers</NavLink>
        </nav>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p>Financing Management</p>
            <h1>Loan Requests</h1>
          </div>
        </div>

        <section className="loan-admin-filters">
          <input
            type="text"
            placeholder="Search name, email, phone, institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>

            <option value="pending">Pending</option>

            <option value="contacted">Contacted</option>

            <option value="sent-to-bank">
              Sent to Institution
            </option>

            <option value="under-assessment">
              Under Assessment
            </option>

            <option value="approved">Approved</option>

            <option value="installation-scheduled">
              Installation Scheduled
            </option>

            <option value="completed">Completed</option>

            <option value="declined">Declined</option>
          </select>
        </section>

        {message && <p className="loan-admin-message">{message}</p>}

        <section className="admin-panel">
          <div className="loan-admin-head">
            <h2>{filteredRequests.length} Loan Requests</h2>
          </div>

          {loading ? (
            <div className="loan-empty-box">Loading loan requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="loan-empty-box">No loan requests found.</div>
          ) : (
            <div className="loan-request-grid">
              {filteredRequests.map((request) => (
                <div className="loan-request-card" key={request._id}>
                  <div className="loan-request-top">
                    <div>
                      <h3>{request.customer?.fullName}</h3>
                      <p>{request.customer?.email}</p>
                      <p>{request.customer?.phone}</p>
                    </div>

                    <span className={`loan-status ${request.status}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="loan-request-details">
                    <p>
                      <strong>Product Source:</strong>{" "}
                      {request.productSource || "N/A"}
                    </p>

                    <p>
                      <strong>Finance Institution:</strong>{" "}
                      {request.financeInstitution ||
                        request.bankPartner ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Estimated Amount:</strong>{" "}
                      {request.estimatedAmount
                        ? `₦${Number(
                            request.estimatedAmount
                          ).toLocaleString()}`
                        : "Request Price"}
                    </p>

                    <p>
                      <strong>Preferred Contact:</strong>{" "}
                      {request.preferredContact || "WhatsApp"}
                    </p>

                    <p>
                      <strong>Consent:</strong>{" "}
                      {request.consentToShare ? "Yes" : "No"}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  {request.productSource === "External Vendor" && (
                    <div className="loan-external-box">
                      <h4>External Vendor</h4>
                      <p>
                        <strong>Name:</strong> {request.vendorName || "N/A"}
                      </p>
                      <p>
                        <strong>Contact:</strong>{" "}
                        {request.vendorContact || "N/A"}
                      </p>
                      <p>
                        <strong>Details:</strong>{" "}
                        {request.vendorProductDetails || "N/A"}
                      </p>
                    </div>
                  )}

                  <div className="loan-items-box">
                    <h4>Requested Items</h4>

                    {request.items?.length > 0 ? (
                      request.items.map((item, index) => (
                        <div className="loan-item-row" key={item._id || index}>
                          <span>{item.name}</span>
                          <strong>
                            {item.price
                              ? `₦${Number(item.price).toLocaleString()}`
                              : "Request Price"}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p>No items listed.</p>
                    )}
                  </div>

                  {request.notes && (
                    <div className="loan-notes-box">
                      <h4>Notes</h4>
                      <p>{request.notes}</p>
                    </div>
                  )}

                <div className="loan-status-actions">

                  <button
                    onClick={() =>
                      updateStatus(request._id, "contacted")
                    }
                  >
                    Contacted
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(request._id, "sent-to-bank")
                    }
                  >
                    Send to Bank
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(request._id, "under-assessment")
                    }
                  >
                    Under Review
                  </button>

                  <button
                    className="success"
                    onClick={() =>
                      updateStatus(request._id, "approved")
                    }
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        request._id,
                        "installation-scheduled"
                      )
                    }
                  >
                    Schedule Install
                  </button>

                  <button
                    className="success"
                    onClick={() =>
                      updateStatus(request._id, "completed")
                    }
                  >
                    Completed
                  </button>

                  <button
                    className="danger"
                    onClick={() =>
                      updateStatus(request._id, "declined")
                    }
                  >
                    Decline
                  </button>

                  <button
                    className="danger"
                    onClick={() =>
                      deleteLoanRequest(request._id)
                    }
                  >
                    Delete
                  </button>

                </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminLoanRequests;