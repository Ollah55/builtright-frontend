import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./paymentSuccess.css";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { reference, amount, customer, cartItems } = location.state || {};

  useEffect(() => {
    const finalizeOrder = async () => {
      if (!reference || !customer || !amount || !cartItems) {
        setErrorMessage("Missing payment details. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/orders/finalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
            amount,
            customer,
            cartItems,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
          throw new Error(data.message || "Failed to finalize order.");
        }

        setOrder(data.order);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    finalizeOrder();
  }, [reference, amount, customer, cartItems]);

  const handleViewReceipt = () => {
    if (!order) return;

    navigate("/receipt", {
      state: order,
    });
  };

  return (
    <div className="payment-success">
      <div className="success-card">
        <div className="success-icon">✓</div>

        {loading ? (
          <>
            <h1>Finalizing Your Order</h1>
            <p>Please wait while we verify payment and prepare your receipt.</p>
          </>
        ) : errorMessage ? (
          <>
            <h1>Order Finalization Failed</h1>
            <p>{errorMessage}</p>
            <div className="success-actions">
              <Link to="/" className="btn secondary">
                Go Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1>Payment Successful</h1>
            <p>Your order has been confirmed successfully.</p>

            <div className="success-details">
              <p>
                <span>Order Number:</span> {order.orderNumber}
              </p>
              <p>
                <span>Reference:</span> {order.reference}
              </p>
              <p>
                <span>Amount Paid:</span> ₦{order.amount.toLocaleString()}
              </p>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="btn primary"
                onClick={handleViewReceipt}
              >
                View Receipt
              </button>

              <Link to="/shop" className="btn secondary">
                Continue Shopping
              </Link>

              <Link to="/" className="btn tertiary">
                Go Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
