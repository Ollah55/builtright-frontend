import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import "./financingform.css";

const financeInstitutions = {
  "Rich Green Microfinance Bank": {
    interestRate: "8%",
    loanTenor: "6 months",
    depositRequired: "20%",
  },
  "Premium Trust Bank": {
    interestRate: "10%",
    loanTenor: "12 months",
    depositRequired: "30%",
  },
  "Zenith Bank": {
    interestRate: "7.5%",
    loanTenor: "16 months",
    depositRequired: "25%",
  },
};

function FinancingForm() {
  const location = useLocation();
  // const navigate = useNavigate();

  const passedState = location.state || {};
  const cartItems = passedState.cartItems || [];
  const estimatedAmount = passedState.totalAmount ?? null;

  const [formData, setFormData] = useState({
    fullName: passedState.customer?.fullName || "",
    email: passedState.customer?.email || "",
    phone: passedState.customer?.phone || "",
    location: "",
    occupation: "",
    productSource:
      cartItems.length > 0 ? "BuiltRight Marketplace" : "External Vendor",
    financeInstitution: "Rich Green Microfinance Bank",
    vendorName: "",
    vendorContact: "",
    vendorProductDetails: "",
    notes: "",
    consentToShare: false,
    liabilityAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const isExternalVendor = formData.productSource === "External Vendor";
  const selectedTerms = financeInstitutions[formData.financeInstitution];

  const items = isExternalVendor
    ? [
        {
          id: `external-${Date.now()}`,
          name: formData.vendorProductDetails || "External Solar System",
          quantity: 1,
          price: null,
          supplier: formData.vendorName || "External Vendor",
          manufacturer: "External Vendor",
          category: "external-solar-system",
          type: "Third-Party Solar System",
          capacity: "",
        },
      ]
    : cartItems.map((item) => ({
    id: item.id || item._id || "",
    name: item.name || "Selected Product",
    quantity: item.quantity || 1,
    price: item.price ?? item.amount ?? item.total ?? 0,
    supplier: item.supplier || "",
    manufacturer: item.manufacturer || item.brand || "",
    category: item.category || "",
    type: item.type || "",
    capacity: item.capacity || "",
    image: item.image || item.images?.[0] || "",
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildWhatsAppMessage = () => {
    const itemsText =
      items.length > 0
        ? items
            .map(
              (item) =>
                `- ${item.name} x${item.quantity}${
                  item.price != null
                    ? ` (₦${Number(item.price).toLocaleString()})`
                    : " (Request Price)"
                }`
            )
            .join("\n")
        : "- No product selected";

    return `Hello BuiltRight,

    I am interested in your financing / loan option.

    Name: ${formData.fullName}
    Email: ${formData.email}
    Phone: ${formData.phone}
    Location: ${formData.location || "Not provided"}
    Occupation: ${formData.occupation || "Not provided"}

    Product Source: ${formData.productSource}

    Selected Financing Institution:
    ${formData.financeInstitution}

    Financing Terms:
    Interest Rate: ${selectedTerms.interestRate}
    Loan Tenor: ${selectedTerms.loanTenor}
    Deposit Required: ${selectedTerms.depositRequired}

    Selected Products:
    ${itemsText}

    ${
      isExternalVendor
        ? `External Vendor Details:
    Vendor Name: ${formData.vendorName || "Not provided"}
    Vendor Contact: ${formData.vendorContact || "Not provided"}
    Product/System Details: ${formData.vendorProductDetails || "Not provided"}`
        : ""
    }

    Estimated Budget: ${
          estimatedAmount != null && estimatedAmount > 0
            ? `₦${Number(estimatedAmount).toLocaleString()}`
            : "Request Price"
        }

    Notes:
    ${formData.notes || "No additional notes."}

    I consent to BuiltRight sharing my financing request details with my selected financing institution for loan review and processing.

    Please guide me on the next steps.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      setStatusMessage("Please fill in your full name, email, and phone number.");
      return;
    }

    if (!formData.financeInstitution) {
      setStatusMessage("Please select a financing institution.");
      return;
    }

    if (!formData.consentToShare) {
      setStatusMessage(
        "Please consent to BuiltRight sharing your request with your selected financing institution."
      );
      return;
    }

    if (!isExternalVendor && items.length === 0) {
      setStatusMessage(
        "Please add products from the BuiltRight marketplace before requesting financing."
      );
      return;
    }

    if (
      isExternalVendor &&
      (!formData.vendorName ||
        !formData.vendorContact ||
        !formData.vendorProductDetails)
    ) {
      setStatusMessage(
        "Please provide the external vendor name, vendor contact, and product/system details."
      );
      return;
    }

    if (isExternalVendor && !formData.liabilityAccepted) {
      setStatusMessage(
        "Please accept the third-party product responsibility notice."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage("");

      const response = await fetch("https://builtright-backend.onrender.com/api/loan-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          items,
          estimatedAmount,
          productSource: formData.productSource,
          financeInstitution: formData.financeInstitution,
          interestRate: selectedTerms.interestRate,
          loanTenor: selectedTerms.loanTenor,
          depositRequired: selectedTerms.depositRequired,
          vendorName: formData.vendorName,
          vendorContact: formData.vendorContact,
          vendorProductDetails: formData.vendorProductDetails,
          consentToShare: formData.consentToShare,
          thirdPartyNoticeAccepted: formData.liabilityAccepted,
          notes: `Location: ${formData.location || "Not provided"}
          Occupation: ${formData.occupation || "Not provided"}
          Product Source: ${formData.productSource}
          Finance Institution: ${formData.financeInstitution}
          Interest Rate: ${selectedTerms.interestRate}
          Loan Tenor: ${selectedTerms.loanTenor}
          Deposit Required: ${selectedTerms.depositRequired}
          External Vendor Name: ${formData.vendorName || "N/A"}
          External Vendor Contact: ${formData.vendorContact || "N/A"}
          External Product/System Details: ${formData.vendorProductDetails || "N/A"}
          Additional Notes: ${formData.notes || "No additional notes."}
          Consent to Share: ${formData.consentToShare ? "Yes" : "No"}
          Third-Party Liability Notice Accepted: ${
            formData.liabilityAccepted ? "Yes" : "Not Applicable"
          }`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to submit financing request.");
      }

      const whatsappLink = `https://wa.me/2349134991239?text=${encodeURIComponent(
        buildWhatsAppMessage()
      )}`;

      setStatusMessage(
        "Financing request submitted successfully. Redirecting you to WhatsApp..."
      );

      setTimeout(() => {
        window.location.href = whatsappLink;
      }, 900);
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="financing-page">
      <Helmet>
        <title>Financing / Loan Request | BuiltRight</title>
        <meta
          name="description"
          content="Submit a financing request for BuiltRight marketplace products or third-party solar systems through BuiltRight financing partners."
        />
      </Helmet>

      <section className="financing-hero">
        <div className="financing-hero-content">
          <p className="section-label">Financing</p>
          <h1>Flexible Financing for Solar Solutions</h1>
          <p>
            Request financing for products from the BuiltRight marketplace or a
            solar system you found from an external vendor. Choose your preferred
            financing institution and review their terms before submitting.
          </p>
        </div>
      </section>

      <section className="loan-process-section">
        <div className="loan-process-head">
          <p className="section-label">How It Works</p>
          <h2>Simple Loan Process</h2>
        </div>

        <div className="loan-process-grid">
          <div className="loan-step-card">
            <span>01</span>
            <h3>Submit Request</h3>
            <p>
              Choose marketplace or external vendor financing and submit your
              details.
            </p>
          </div>

          <div className="loan-step-card">
            <span>02</span>
            <h3>Select Institution</h3>
            <p>
              Choose your preferred financing institution and review the terms.
            </p>
          </div>

          <div className="loan-step-card">
            <span>03</span>
            <h3>Request Review</h3>
            <p>
              BuiltRight reviews your request and shares it with the selected
              institution.
            </p>
          </div>

          <div className="loan-step-card">
            <span>04</span>
            <h3>Approval & Next Steps</h3>
            <p>
              Once approved, purchase, delivery, or installation steps begin.
            </p>
          </div>
        </div>
      </section>

      <section className="financing-content">
        <div className="financing-summary-card">
          <h2>Financing Summary</h2>

          <div className="source-summary-box">
            <h3>{formData.productSource}</h3>
            <p>
              {isExternalVendor
                ? "You are requesting financing for a solar system sourced from an external vendor."
                : "You are requesting financing for products selected from the BuiltRight marketplace."}
            </p>
          </div>

          <div className="finance-terms-box">
            <h3>{formData.financeInstitution}</h3>

            <div className="finance-terms-grid">
              <div>
                <span>Interest Rate</span>
                <strong>{selectedTerms.interestRate}</strong>
              </div>

              <div>
                <span>Loan Tenor</span>
                <strong>{selectedTerms.loanTenor}</strong>
              </div>

              <div>
                <span>Deposit</span>
                <strong>{selectedTerms.depositRequired}</strong>
              </div>
            </div>

            <p>
              Final approval is subject to the selected institution’s review,
              eligibility checks, documentation, and credit assessment.
            </p>
          </div>

          {!isExternalVendor && (
            <>
              <h2>Selected Products</h2>

              {items.length === 0 ? (
                <p>No products selected.</p>
              ) : (
                <>
                  {items.map((item) => (
                    <div className="financing-item" key={item.id || item._id}>
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.manufacturer || item.supplier || "Product"} •
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <strong>
                        {item.price != null
                          ? `₦${Number(item.price).toLocaleString()}`
                          : "Request Price"}
                      </strong>
                    </div>
                  ))}

                  <div className="financing-total">
                    <span>Estimated Total</span>
                    <strong>
                      {estimatedAmount != null && estimatedAmount > 0
                        ? `₦${Number(estimatedAmount).toLocaleString()}`
                        : "Request Price"}
                    </strong>
                  </div>
                </>
              )}
            </>
          )}

          {isExternalVendor && (
            <div className="external-summary-note">
              <h3>Third-Party Product Notice</h3>
              <p>
                BuiltRight may assist with financing coordination for approved
                third-party systems. However, products sourced outside the
                BuiltRight supplier network remain the responsibility of their
                original vendors and manufacturers while BuiltRight may support
                maintenance and installation where agreed.
              </p>
            </div>
          )}
        </div>

        <div className="financing-form-card">
          <h2>Submit Financing Request</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name*"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address*"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number*"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <input
              type="text"
              name="occupation"
              placeholder="Occupation"
              value={formData.occupation}
              onChange={handleChange}
            />

            <div className="form-group">
              <label>Product Source</label>
              <select
                name="productSource"
                value={formData.productSource}
                onChange={handleChange}
              >
                <option value="BuiltRight Marketplace">
                  BuiltRight Marketplace
                </option>
                <option value="External Vendor">
                  External Vendor / Third-Party Supplier
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Financing Institution</label>
              <select
                name="financeInstitution"
                value={formData.financeInstitution}
                onChange={handleChange}
              >
                {Object.keys(financeInstitutions).map((institution) => (
                  <option key={institution} value={institution}>
                    {institution}
                  </option>
                ))}
              </select>
            </div>

            <div className="selected-bank-terms">
              <h3>{formData.financeInstitution} Terms</h3>

              <div className="selected-bank-grid">
                <div>
                  <span>Interest</span>
                  <strong>{selectedTerms.interestRate}</strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>{selectedTerms.loanTenor}</strong>
                </div>

                <div>
                  <span>Deposit</span>
                  <strong>{selectedTerms.depositRequired}</strong>
                </div>
              </div>

              <p>
                These are indicative financing terms. Final approval depends on
                institution review and customer eligibility.
              </p>
            </div>

            {isExternalVendor && (
              <div className="external-vendor-section">
                <h3>External Vendor Information</h3>

                <div className="form-group">
                  <label>Vendor Name*</label>
                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    placeholder="Enter vendor or supplier name"
                  />
                </div>

                <div className="form-group">
                  <label>Vendor Contact*</label>
                  <input
                    type="text"
                    name="vendorContact"
                    value={formData.vendorContact}
                    onChange={handleChange}
                    placeholder="Phone number, WhatsApp, or email"
                  />
                </div>

                <div className="form-group">
                  <label>Product/System Details*</label>
                  <textarea
                    name="vendorProductDetails"
                    value={formData.vendorProductDetails}
                    onChange={handleChange}
                    placeholder="Describe the solar system, product specs, quotation details, or vendor offer"
                    rows="5"
                  ></textarea>
                </div>

                <div className="external-vendor-notice">
                  <p>
                    BuiltRight acts as a financing facilitator only for approved
                    third-party systems. BuiltRight does not assume
                    responsibility for product defects, warranty issues, or
                    after-sales support from external vendors.
                  </p>
                </div>

                <label className="consent-check">
                  <input
                    type="checkbox"
                    name="liabilityAccepted"
                    checked={formData.liabilityAccepted}
                    onChange={handleChange}
                  />
                  <span>
                    I understand that third-party products remain the
                    responsibility of the original vendor, manufacturer, or
                    installer.
                  </span>
                </label>
              </div>
            )}

            <textarea
              name="notes"
              placeholder="Additional Notes"
              rows="5"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>

            <label className="consent-check">
              <input
                type="checkbox"
                name="consentToShare"
                checked={formData.consentToShare}
                onChange={handleChange}
              />
              <span>
                I consent to BuiltRight sharing my financing request details
                with my selected financing institution for loan review and
                processing.
              </span>
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit & Continue to WhatsApp"}
            </button>

            {statusMessage && (
              <p className="financing-status">{statusMessage}</p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default FinancingForm;