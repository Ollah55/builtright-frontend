import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiClock, FiFileText, FiMapPin } from "react-icons/fi";
import CustomerLayout from "../../components/CustomerLayout/CustomerLayout";
import {
  FINANCING_STAGES,
  formatMoney,
  getFinancingStage,
  getNextFinancingStage,
  getStageIndex,
  normalizeFinancingStatus,
  statusTone,
  demoFinancingRequests,
} from "../../lib/operations";
import { isDevelopmentPreview } from "../../lib/previewMode";
import "./customerFinancing.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

const customerMilestones = [
  { id: "submitted", label: "Request" },
  { id: "inspection-scheduled", label: "Inspection" },
  { id: "load-audit-completed", label: "Load audit" },
  { id: "due-diligence-passed", label: "Due diligence" },
  { id: "quotation-sent", label: "Quotation" },
  { id: "quotation-approved", label: "Your approval" },
  { id: "sent-to-bank", label: "Bank review" },
  { id: "disbursed", label: "Disbursement" },
  { id: "completed", label: "Installation" },
];

function CustomerFinancing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("customerUser"));
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [paymentProofs, setPaymentProofs] = useState({});
  const [uploadingPaymentId, setUploadingPaymentId] = useState("");

  useEffect(() => {
    const loadLoanRequests = async () => {
      const isLocalPreview = isDevelopmentPreview();

      if (isLocalPreview) {
        setLoanRequests(demoFinancingRequests);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("customerToken");
        const response = await fetch(`${API_BASE_URL}/api/customer/loan-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Failed to load your financing requests.");
        setLoanRequests(data.loanRequests || []);
      } catch (error) {
        setMessage(error.message || "Failed to load your financing requests.");
      } finally {
        setLoading(false);
      }
    };
    loadLoanRequests();
  }, []);

  const uploadInspectionPaymentProof = async (request) => {
    const proof = paymentProofs[request._id];
    if (!proof) {
      setMessage("Choose your inspection-fee payment proof before confirming payment.");
      return;
    }
    try {
      setUploadingPaymentId(request._id);
      setMessage("");
      const formData = new FormData();
      formData.append("proof", proof);
      const response = await fetch(`${API_BASE_URL}/api/customer/loan-requests/${request._id}/inspection-payment-proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("customerToken")}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not upload payment proof.");
      setLoanRequests((items) => items.map((item) => item._id === request._id ? data.loanRequest : item));
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message || "Could not upload payment proof.");
    } finally {
      setUploadingPaymentId("");
    }
  };

  return (
    <CustomerLayout>
      <main className="customer-financing-main">
        <section className="customer-financing-topbar">
          <div><p>Solar financing</p><h1>My financing requests</h1><span>Track inspection, load audit, due diligence, quotation approval, bank application, disbursement, and installation.</span></div>
          <button type="button" onClick={() => navigate("/financing")}>Submit a new request <FiArrowRight /></button>
        </section>

        <section className="customer-financing-explainer">
          <FiFileText />
          <div><strong>A request is not yet a loan or confirmed order.</strong><p>BuiltRight completes inspection, load audit, and due diligence first. Your bank application becomes available only after you approve the final project quotation.</p></div>
        </section>

        {message && <p className="customer-financing-message">{message}</p>}

        {loading ? (
          <section className="customer-financing-empty">Loading your financing requests...</section>
        ) : loanRequests.length === 0 ? (
          <section className="customer-financing-empty">
            <h3>No financing requests yet</h3>
            <p>Select a solar system and submit a financing request to begin.</p>
            <button type="button" onClick={() => navigate("/shop")}>Browse solar systems</button>
          </section>
        ) : (
          <section className="customer-financing-grid">
            {loanRequests.map((request) => {
              const status = normalizeFinancingStatus(request.status);
              const stage = getFinancingStage(status);
              const nextStage = getNextFinancingStage(status);
              const currentIndex = getStageIndex(status);
              const firstItem = request.items?.[0];
              const bankApplicationUrl = request.bankApplication?.redirectUrl;
              const isOutright = request.paymentMethod === "outright";
              const quotationApproved = status === "quotation-approved" || currentIndex > getStageIndex("quotation-approved");
              const quotationAvailable = currentIndex >= getStageIndex("quotation-draft");
              const inspectionFeeStatus = request.inspection?.feeStatus || "not-requested";
              const nextAction =
                status === "quotation-sent"
                  ? "Review and accept your final quotation"
                  : quotationApproved && bankApplicationUrl
                    ? "Continue to the bank's secure credit application"
                    : quotationApproved
                      ? (isOutright ? "Your quotation is approved; BuiltRight will issue your final payment invoice" : "Your quotation is approved; BuiltRight is preparing the bank application link")
                      : status === "rejected"
                        ? "BuiltRight will contact you about available next steps"
                        : nextStage?.customerLabel || "Your project is complete";
              return (
                <article className="customer-financing-card" key={request._id}>
                  <header className="customer-financing-card-top">
                    <div><span>{request.reference || `BRF-${String(request._id).slice(-5).toUpperCase()}`}</span><h2>{firstItem?.name || request.systemName || "Solar financing request"}</h2><p><FiMapPin /> {request.customer?.location || user?.location || "Project location pending"}</p></div>
                    <i className={`customer-status-pill ${statusTone(status)}`}>{stage.customerLabel}</i>
                  </header>

                  <div className="customer-finance-timeline">
                    {customerMilestones.map((milestone) => {
                      const milestoneIndex = FINANCING_STAGES.findIndex((item) => item.id === milestone.id);
                      const complete = currentIndex >= milestoneIndex && status !== "rejected";
                      return <div className={complete ? "complete" : ""} key={milestone.id}><span>{complete ? <FiCheck /> : ""}</span><p>{milestone.label}</p></div>;
                    })}
                  </div>

                  <div className="customer-financing-summary">
                    <div><span>Selected system</span><strong>{firstItem?.capacity || request.systemCapacity || firstItem?.name || request.systemName || "To be confirmed"}</strong><small>{request.productSource || "BuiltRight Marketplace"}</small></div>
                    <div><span>Selected system price</span><strong>{formatMoney(request.estimatedAmount)}</strong><small>Excludes installation and materials</small></div>
                    <div><span>Final project quotation</span><strong>{formatMoney(request.finalProjectCost)}</strong><small>{quotationApproved ? "Approved by you" : request.finalProjectCost ? "Review required" : "Pending assessment"}</small></div>
                    <div><span>{isOutright ? "Payment route" : "Bank application"}</span><strong>{isOutright ? "Outright payment" : (request.bankApplication?.status || "Not available yet")}</strong><small>{isOutright ? "Invoice follows quotation approval" : (bankApplicationUrl ? "Secure link ready" : "Opens after quote approval")}</small></div>
                  </div>

                  {["payment-requested", "proof-submitted", "payment-confirmed"].includes(inspectionFeeStatus) && <section className="customer-inspection-payment">
                    <div><span>Inspection fee</span><strong>{formatMoney(request.inspection?.feeAmount)}</strong><small>{inspectionFeeStatus === "proof-submitted" ? "Payment proof submitted — awaiting installer confirmation" : inspectionFeeStatus === "payment-confirmed" ? "Payment confirmed — inspection in progress" : "Pay to FCMB · 2008839924 · BuiltRight Services Ltd"}</small></div>
                    {inspectionFeeStatus === "payment-requested" && <div className="customer-payment-proof-form"><label>Upload payment proof<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setPaymentProofs((current) => ({ ...current, [request._id]: event.target.files?.[0] || null }))} /></label><button type="button" disabled={uploadingPaymentId === request._id} onClick={() => uploadInspectionPaymentProof(request)}>{uploadingPaymentId === request._id ? "Uploading..." : "I have paid — submit proof"}</button></div>}
                  </section>}

                  <section className="customer-next-step">
                    <FiClock />
                    <div><span>What happens next</span><strong>{nextAction}</strong></div>
                  </section>

                  <footer className="customer-financing-footer">
                    <span>Submitted {request.createdAt ? new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "recently"}</span>
                    <div className="customer-financing-footer-actions">
                      {bankApplicationUrl && quotationApproved && (
                        <a href={bankApplicationUrl} target="_blank" rel="noreferrer">Apply with bank <FiArrowRight /></a>
                      )}
                      <button type="button" onClick={() => navigate("/customer/documents")}>
                        {quotationAvailable ? "View quotation" : "View documents"} <FiArrowRight />
                      </button>
                    </div>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </CustomerLayout>
  );
}

export default CustomerFinancing;
