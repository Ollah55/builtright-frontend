import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import PaystackPop from "@paystack/inline-js";
import { useCart } from "../../context/useCart";
import "./checkout.css";

function Checkout() {
  const { cartItems, totalAmount, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasUnpricedItems = cartItems.some((item) => item.price == null);

  const handleOutrightPayment = async () => {
    if (!acceptedTerms) {
      setStatusMessage("Please accept the agreement and terms before proceeding.");
      return;
    }

    if (!customer.fullName || !customer.email || !customer.phone) {
      setStatusMessage("Please fill in your name, email, and phone number.");
      return;
    }

    if (cartItems.length === 0) {
      setStatusMessage("Your cart is empty.");
      return;
    }

    if (hasUnpricedItems || totalAmount <= 0) {
      setStatusMessage(
        "Some products in your cart do not yet have confirmed prices. Please use Financing / Loan or contact us for a quote."
      );
      return;
    }

    try {
      setIsPaying(true);
      setStatusMessage("");

      const itemsForReceipt = [...cartItems];

      const response = await fetch(
        "https://builtright-backend.onrender.com/api/paystack/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customer.email,
            amount: totalAmount,
            fullName: customer.fullName,
            phone: customer.phone,
            cartItems: itemsForReceipt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to initialize payment.");
      }

      const popup = new PaystackPop();

      popup.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: customer.email,
        amount: totalAmount * 100,
        ref: data.data.reference,

        onSuccess: async (transaction) => {
          try {
            const verifyResponse = await fetch(
              `https://builtright-backend.onrender.com/api/paystack/verify/${transaction.reference}`
            );

            const verifyData = await verifyResponse.json();

            if (
              verifyResponse.ok &&
              verifyData.status &&
              verifyData.data?.status === "success"
            ) {
              navigate("/payment-success", {
                state: {
                  reference: transaction.reference,
                  customer,
                  amount: totalAmount,
                  cartItems: itemsForReceipt,
                },
              });

              clearCart();
            } else {
              setStatusMessage(
                "Payment was completed but verification failed. Please contact support."
              );
            }
          } catch (error) {
            console.error(error);
            setStatusMessage(
              "Payment succeeded, but verification failed. Please contact support."
            );
          } finally {
            setIsPaying(false);
          }
        },

        onCancel: () => {
          setStatusMessage("Payment was cancelled.");
          setIsPaying(false);
        },
      });
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || "Something went wrong.");
      setIsPaying(false);
    }
  };

  const handleFinancing = () => {
    if (!acceptedTerms) {
      setStatusMessage("Please accept the agreement and terms before proceeding.");
      return;
    }

    if (!customer.fullName || !customer.email || !customer.phone) {
      setStatusMessage("Please fill in your name, email, and phone number.");
      return;
    }

    if (cartItems.length === 0) {
      setStatusMessage("Your cart is empty.");
      return;
    }

    navigate("/financing", {
      state: {
        customer,
        cartItems,
        totalAmount,
      },
    });
  };

  return (
    <div className="checkout-page">
      <Helmet>
        <title>Checkout | BuiltRight Shop</title>
      </Helmet>

      <section className="checkout-hero">
        <p className="section-label">Checkout</p>
        <h1>Review Your Order</h1>
      </section>

      <section className="checkout-content">
        <div className="checkout-summary">
          <div className="checkout-actions">
            <h2>Order Summary</h2>

            <button
              type="button"
              className="continue-shopping-btn"
              onClick={() => navigate("/shop")}
            >
              ← Continue Shopping
            </button>
          </div>

          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-info">
                    <h3>{item.name}</h3>
                    {item.manufacturer && <p>{item.manufacturer}</p>}
                    <p>
                      {item.price != null
                        ? `₦${item.price.toLocaleString()}`
                        : "Request Price"}
                    </p>
                  </div>

                  <div className="checkout-item-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="checkout-item-total">
                    {item.price != null
                      ? `₦${(item.price * item.quantity).toLocaleString()}`
                      : "Request Price"}
                  </div>

                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="checkout-total">
                <strong>Total</strong>
                <strong>
                  {totalAmount > 0
                    ? `₦${totalAmount.toLocaleString()}`
                    : "Request Price"}
                </strong>
              </div>
            </>
          )}
        </div>

        <div className="checkout-methods">
          <h2>Customer Details</h2>

          <div className="checkout-customer-form">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={customer.fullName}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={customer.email}
              onChange={handleChange}
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={handleChange}
            />
          </div>

          <div className="checkout-terms-box">
            <label className="checkout-terms-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                I agree to the terms and conditions, including outright payment
                or financing requirements, deposit obligations where applicable,
                and possible retrieval of the device in the event of payment
                default.
              </span>
            </label>
          </div>

          <h2>Select Payment Option</h2>
          <p>Choose how you want to proceed with your purchase.</p>

          <button
            type="button"
            className="checkout-btn primary"
            onClick={handleOutrightPayment}
            disabled={isPaying || cartItems.length === 0 || !acceptedTerms}
          >
            {isPaying ? "Processing..." : "Pay with Paystack"}
          </button>

          <button
            type="button"
            className="checkout-btn secondary"
            onClick={handleFinancing}
            disabled={cartItems.length === 0 || !acceptedTerms}
          >
            Financing / Loan
          </button>

          {statusMessage && <p className="checkout-status">{statusMessage}</p>}
        </div>
      </section>
    </div>
  );
}

export default Checkout;