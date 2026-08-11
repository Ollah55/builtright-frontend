import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import "./financingform.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

function FinancingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedState = location.state || {};
  const cartItems = passedState.cartItems || [];
  const estimatedAmount = passedState.totalAmount ?? null;

  const [formData, setFormData] = useState({
    fullName: passedState.customer?.fullName || "",
    email: passedState.customer?.email || "",
    phone: passedState.customer?.phone || "",
    location: passedState.customer?.location || "",
    occupation: "",
    productSource: cartItems.length > 0 ? "BuiltRight Marketplace" : "External Vendor",
    vendorName: "",
    vendorContact: "",
    vendorProductDetails: "",
    notes: "",
    consentToShare: false,
    liabilityAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [submittedReference, setSubmittedReference] = useState("");

  const isExternalVendor = formData.productSource === "External Vendor";
  const items = isExternalVendor
    ? [{
          id: "external-system",
          name: formData.vendorProductDetails || "External solar system",
          quantity: 1,
          price: null,
          supplier: formData.vendorName || "External vendor",
          manufacturer: "External vendor",
          category: "external-solar-system",
          type: "Third-party solar system",
          capacity: "",
      }]
    : cartItems.map((item) => ({
          id: item.id || item._id || "",
          name: item.name || "Selected product",
          quantity: item.quantity || 1,
          price: item.price ?? item.amount ?? item.total ?? 0,
          supplier: item.supplier || "",
          manufacturer: item.manufacturer || item.brand || "",
          category: item.category || "",
          type: item.type || "",
          capacity: item.capacity || "",
          image: item.image || item.images?.[0] || "",
      }));

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    if (!formData.fullName || !formData.email || !formData.phone || !formData.location) {
      setStatusMessage("Please provide your name, email, phone number, and project location.");
      return;
    }
    if (!formData.consentToShare) {
      setStatusMessage("Please accept the assessment and data-sharing consent to continue.");
      return;
    }
    if (!isExternalVendor && items.length === 0) {
      setStatusMessage("Please add a solar system from the BuiltRight shop before requesting financing.");
      return;
    }
    if (isExternalVendor && (!formData.vendorName || !formData.vendorContact || !formData.vendorProductDetails)) {
      setStatusMessage("Please provide the external vendor name, contact, and complete system details.");
      return;
    }
    if (isExternalVendor && !formData.liabilityAccepted) {
      setStatusMessage("Please accept the third-party product responsibility notice.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/loan-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
          },
          items,
          estimatedAmount,
          productSource: formData.productSource,
          financeInstitution: "Bank partner pending",
          interestRate: "",
          loanTenor: "",
          depositRequired: "20% of approved total project cost",
          vendorName: formData.vendorName,
          vendorContact: formData.vendorContact,
          vendorProductDetails: formData.vendorProductDetails,
          consentToShare: formData.consentToShare,
          thirdPartyNoticeAccepted: formData.liabilityAccepted,
          notes: `Occupation: ${formData.occupation || "Not provided"}\nAdditional notes: ${formData.notes || "None"}`,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Failed to submit financing request.");

      const reference = data.loanRequest?.reference || `BRF-${String(data.loanRequest?._id || "NEW").slice(-5).toUpperCase()}`;
      setSubmittedReference(reference);
      setStatusMessage(`Request ${reference} submitted. BuiltRight will now arrange inspection, load audit, and due diligence.`);
    } catch (error) {
      setStatusMessage(error.message || "Something went wrong while submitting your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="financing-page">
      <Helmet>
        <title>Submit Financing Request | BuiltRight</title>
        <meta name="description" content="Submit a BuiltRight solar financing request for assessment, final quotation, customer approval, and a bank-hosted credit application." />
      </Helmet>

      <section className="financing-hero">
        <div className="financing-hero-content">
          <p className="section-label">Solar financing</p>
          <h1>Start with the right project assessment</h1>
          <p>Tell us the solar system you prefer. BuiltRight will complete inspection, load audit, and due diligence before preparing the final project quotation for your approval.</p>
        </div>
      </section>

      <section className="loan-process-section">
        <div className="loan-process-head"><p className="section-label">How it works</p><h2>Assessment before bank application</h2></div>
        <div className="loan-process-grid">
          <article className="loan-step-card"><span>01</span><h3>Submit request</h3><p>Select your preferred system and provide the project location and contact details.</p></article>
          <article className="loan-step-card"><span>02</span><h3>Assess the project</h3><p>BuiltRight completes site inspection, load audit, technical checks, and due diligence.</p></article>
          <article className="loan-step-card"><span>03</span><h3>Approve quotation</h3><p>Review the full system, materials, installation scope, total cost, and 20% equity amount.</p></article>
          <article className="loan-step-card"><span>04</span><h3>Apply with the bank</h3><p>After approval, the secure bank button opens for KYC, credit checks, account opening, and payment.</p></article>
        </div>
      </section>

      <section className="financing-content">
        <aside className="financing-summary-card">
          <h2>Request summary</h2>
          <div className="source-summary-box">
            <h3>{formData.productSource}</h3>
            <p>{isExternalVendor ? "BuiltRight will review the third-party system and confirm whether it is suitable for the proposed project." : "Your selected BuiltRight system begins as a preference; final sizing is confirmed during assessment."}</p>
          </div>

          <div className="finance-terms-box">
            <h3>What happens after submission</h3>
            <div className="finance-terms-grid">
              <div><span>Technical review</span><strong>Inspection</strong></div>
              <div><span>Project pricing</span><strong>Final quote</strong></div>
              <div><span>Bank access</span><strong>After approval</strong></div>
            </div>
            <p>The bank partner and its final lending terms will appear only after you approve BuiltRight's final quotation. The bank—not BuiltRight—will perform credit decisioning and KYC.</p>
          </div>

          {!isExternalVendor && (
            <>
              <h2>Preferred products</h2>
              {items.length === 0 ? <p>No products selected.</p> : items.map((item) => (
                <div className="financing-item" key={item.id || item.name}>
                  <div><h3>{item.name}</h3><p>{item.manufacturer || item.supplier || "Product"} · Qty: {item.quantity}</p></div>
                  <strong>{item.price != null ? `₦${Number(item.price).toLocaleString()}` : "To be assessed"}</strong>
                </div>
              ))}
              <div className="financing-total"><span>Selected system price only</span><strong>{estimatedAmount ? `₦${Number(estimatedAmount).toLocaleString()}` : "To be confirmed"}</strong></div>
              <p className="financing-price-note">Installation labour and materials are excluded here. They will be priced only after inspection, load audit, and due diligence all pass.</p>
            </>
          )}

          <div className="external-summary-note">
            <h3>Final quotation includes the complete project</h3>
            <p>After all assessments pass, the quotation will combine the solar system with finalized installation labour, installation materials, mounting, cable runs, protection accessories, applicable fees, and any additional civil or electrical work.</p>
          </div>
        </aside>

        <section className="financing-form-card">
          <h2>Submit financing request</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input type="text" name="fullName" placeholder="Full name*" value={formData.fullName} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email address*" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <input type="tel" name="phone" placeholder="Phone number*" value={formData.phone} onChange={handleChange} required />
              <input type="text" name="location" placeholder="Project location*" value={formData.location} onChange={handleChange} required />
            </div>
            <input type="text" name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} />

            <div className="form-group">
              <label>Product source</label>
              <select name="productSource" value={formData.productSource} onChange={handleChange}>
                <option value="BuiltRight Marketplace">BuiltRight Marketplace</option>
                <option value="External Vendor">External vendor / third-party supplier</option>
              </select>
            </div>

            <div className="selected-bank-terms">
              <h3>Bank application is not required yet</h3>
              <p>Once your assessment passes and you approve the final quotation, your profile will display the bank's hosted application button and BuiltRight will share the approved quotation with the bank.</p>
            </div>

            {isExternalVendor && (
              <div className="external-vendor-section">
                <h3>External vendor information</h3>
                <div className="form-group"><label>Vendor name*</label><input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} placeholder="Vendor or supplier name" /></div>
                <div className="form-group"><label>Vendor contact*</label><input type="text" name="vendorContact" value={formData.vendorContact} onChange={handleChange} placeholder="Phone, WhatsApp, or email" /></div>
                <div className="form-group"><label>Product/system details*</label><textarea name="vendorProductDetails" value={formData.vendorProductDetails} onChange={handleChange} placeholder="Describe the system, specifications, or vendor offer" rows="5" /></div>
                <div className="external-vendor-notice"><p>Third-party products remain subject to BuiltRight's technical assessment and the original supplier's warranty and product responsibilities.</p></div>
                <label className="consent-check"><input type="checkbox" name="liabilityAccepted" checked={formData.liabilityAccepted} onChange={handleChange} /><span>I understand that third-party product obligations remain with the original vendor or manufacturer unless BuiltRight agrees otherwise in writing.</span></label>
              </div>
            )}

            <textarea name="notes" placeholder="Property details, preferred backup hours, critical appliances, or other notes" rows="5" value={formData.notes} onChange={handleChange} />
            <label className="consent-check">
              <input type="checkbox" name="consentToShare" checked={formData.consentToShare} onChange={handleChange} />
              <span>I authorize BuiltRight to contact me, conduct the project assessment, prepare my quotation, and share my approved quotation and necessary application information with the financing bank.</span>
            </label>

            <button type="submit" disabled={isSubmitting || Boolean(submittedReference)}>{isSubmitting ? "Submitting..." : submittedReference ? "Request submitted" : "Submit financing request"}</button>
            {statusMessage && <p className="financing-status" role="status">{statusMessage}</p>}
            {submittedReference && <button type="button" className="financing-secondary-action" onClick={() => navigate("/customer/financing")}>Track my financing request</button>}
          </form>
        </section>
      </section>
    </div>
  );
}

export default FinancingForm;
