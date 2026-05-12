import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/useCart";
import AgreementModal from "../AgreementModal/AgreementModal";
import "./cartdrawer.css";

function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showAgreement, setShowAgreement] = useState(false);

  const {
    cartItems = [],
    totalAmount = 0,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isOpen) return null;

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      onClose();
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }

    setShowAgreement(true);
  };

  const handleAcceptAgreement = () => {
    setShowAgreement(false);
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div className="cart-drawer-backdrop" onClick={onClose}></div>

      <aside className="cart-drawer">
        <div className="cart-drawer-header">
          <h2>Your Cart</h2>
          <button type="button" className="cart-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item._id}>
                <div className="cart-item-main">
                  <div className="cart-item-text">
                    <h3>{item.name}</h3>
                    {item.brand && <p>{item.brand}</p>}
                    <span>₦{Number(item.price || 0).toLocaleString()}</span>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-footer">
                  <div className="cart-qty-controls">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ₦
                    {Number(
                      (item.price || 0) * (item.quantity || 1)
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-drawer-footer">
          <div className="cart-total-row">
            <span>Total</span>
            <strong>₦{Number(totalAmount).toLocaleString()}</strong>
          </div>

          <button
            type="button"
            className="cart-checkout-btn"
            disabled={cartItems.length === 0}
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>

      <AgreementModal
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        onAccept={handleAcceptAgreement}
      />
    </>
  );
}

export default CartDrawer;