import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/CustomerLayout/CustomerLayout";
import "./customerFinancing.css";

function CustomerFinancing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("customerUser"));

  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadLoanRequests = async () => {
      try {
        const token = localStorage.getItem("customerToken");

        const response = await fetch(
          "https://builtright-backend.onrender.com/api/customer/loan-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status && Array.isArray(data.loanRequests)) {
          setLoanRequests(data.loanRequests);
        } else {
          setLoanRequests([]);
        }
      } catch (error) {
        console.error("LOAD CUSTOMER FINANCING ERROR:", error);
        setMessage("Failed to load your financing requests.");
      } finally {
        setLoading(false);
      }
    };

    loadLoanRequests();
  }, []);

  return (
    <CustomerLayout>
      <main className="customer-financing-main">
        <div className="customer-financing-topbar">
          <div>
            <p>Customer Dashboard</p>
            <h1>My Financing Requests</h1>
          </div>

          <button type="button" onClick={() => navigate("/financing")}>
            New Financing Request
          </button>
        </div>

        {message && <p className="customer-financing-message">{message}</p>}

        <section className="customer-financing-panel">
          <div className="customer-financing-head">
            <h2>
              {loanRequests.length} Request
              {loanRequests.length === 1 ? "" : "s"}
            </h2>
            <p>
              Track your solar financing applications, approval progress, and
              next steps.
            </p>
          </div>

          {loading ? (
            <div className="customer-financing-empty">
              Loading financing requests...
            </div>
          ) : loanRequests.length === 0 ? (
            <div className="customer-financing-empty">
              <h3>No financing requests yet</h3>
              <p>
                When you apply for financing, your request status will appear
                here.
              </p>
              <button type="button" onClick={() => navigate("/shop")}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="customer-financing-grid">
              {loanRequests.map((request) => (
                <div className="customer-financing-card" key={request._id}>
                  <div className="customer-financing-card-top">
                    <div>
                      <h3>
                        {request.financeInstitution ||
                          request.bankPartner ||
                          "Financing Request"}
                      </h3>
                      <p>
                        Submitted{" "}
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <span className={`customer-loan-status ${request.status}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="customer-financing-details">
                    <p>
                      <strong>Applicant:</strong>{" "}
                      {request.customer?.fullName || user?.fullName}
                    </p>

                    <p>
                      <strong>Product Source:</strong>{" "}
                      {request.productSource || "N/A"}
                    </p>

                    <p>
                      <strong>Estimated Amount:</strong>{" "}
                      {request.estimatedAmount
                        ? `₦${Number(request.estimatedAmount).toLocaleString()}`
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
                  </div>

                  <div className="customer-financing-progress">
                    <div
                      className={
                        request.status === "pending" ||
                        request.status === "contacted" ||
                        request.status === "sent-to-bank" ||
                        request.status === "approved"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >
                      Submitted
                    </div>

                    <div
                      className={
                        request.status === "contacted" ||
                        request.status === "sent-to-bank" ||
                        request.status === "approved"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >
                      Reviewed
                    </div>

                    <div
                      className={
                        request.status === "sent-to-bank" ||
                        request.status === "approved"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >
                      Sent
                    </div>

                    <div
                      className={
                        request.status === "approved"
                          ? "progress-step active"
                          : request.status === "declined"
                          ? "progress-step declined"
                          : "progress-step"
                      }
                    >
                      Decision
                    </div>
                  </div>

                  <div className="customer-financing-items">
                    <h4>Requested Items</h4>

                    {request.items?.length > 0 ? (
                      request.items.map((item, index) => (
                        <div
                          className="customer-financing-item"
                          key={item._id || index}
                        >
                          <span>
                            {item.name} x{item.quantity || 1}
                          </span>

                          <strong>
                            {item.price
                              ? `₦${Number(item.price).toLocaleString()}`
                              : "Request Price"}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p>No product details available.</p>
                    )}
                  </div>

                  {request.notes && (
                    <div className="customer-financing-notes">
                      <h4>Notes</h4>
                      <p>{request.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </CustomerLayout>
  );
}

export default CustomerFinancing;