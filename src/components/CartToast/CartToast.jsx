import React, { useEffect, useState } from "react";
import "./carttoast.css";

function CartToast() {
  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  useEffect(() => {
    const handleToast = (event) => {
      setToast({
        show: true,
        message: event.detail.message,
      });

      setTimeout(() => {
        setToast({
          show: false,
          message: "",
        });
      }, 2200);
    };

    window.addEventListener("cart-toast", handleToast);

    return () => {
      window.removeEventListener("cart-toast", handleToast);
    };
  }, []);

  return (
    <div className={`cart-toast ${toast.show ? "show" : ""}`}>
      <span className="cart-toast-icon">🛒</span>
      <span>{toast.message}</span>
    </div>
  );
}

export default CartToast;