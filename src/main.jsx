import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import  CartProvider  from "./context/CartProvider";

if (window.location.hostname.toLowerCase().endsWith(".vercel.app")) {
  const destination = `https://www.builtrightltd.com${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(destination);
} else {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <HelmetProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </HelmetProvider>
    </StrictMode>
  );
}
