import { useEffect, useMemo, useState } from "react";
import CartContext from "./CartContext";

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() =>
  JSON.parse(localStorage.getItem("cart") || "[]")
);

const [compareItems, setCompareItems] = useState(() =>
  JSON.parse(localStorage.getItem("compare") || "[]")
);

  // ✅ Save to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("compare", JSON.stringify(compareItems));
  }, [compareItems]);

  // ✅ Add to cart
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);

      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ✅ Remove from cart
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  // ✅ Update quantity
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity } : item
      )
    );
  };

  // ✅ Clear cart
  const clearCart = () => setCartItems([]);

  // ✅ Toggle compare
  const toggleCompare = (product) => {
    setCompareItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);

      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }

      return [...prev, product];
    });
  };

  // ✅ Total amount
  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        compareItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCompare,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;