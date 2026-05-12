import React, { useState } from "react";
import "./agreementmodal.css";

function AgreementModal({ isOpen, onClose, onAccept }) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="agreement-overlay">
      <div className="agreement-modal">
        <h2>Terms & Purchase Agreement</h2>

        <div className="agreement-content">
          <p><strong>Purchase Options</strong></p>
          <p>You may pay outright or apply for financing (loan).</p>

          <p><strong>Financing Terms</strong></p>
          <p>
            Financing requires an initial deposit and repayment in installments.
            Approval is subject to verification.
          </p>

          <p><strong>Ownership</strong></p>
          <p>
            For financed purchases, BuiltRight retains ownership until full payment.
          </p>

          <p><strong>Default Policy</strong></p>
          <p>
            Failure to pay may result in retrieval of the device without refund.
          </p>

          <p><strong>Pricing & Delivery</strong></p>
          <p>
            Prices and delivery timelines are subject to confirmation.
          </p>
        </div>

        <label className="agreement-checkbox">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>I have read and agree to the Terms and Conditions</span>
        </label>

        <div className="agreement-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="accept-btn"
            disabled={!accepted}
            onClick={onAccept}
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgreementModal;