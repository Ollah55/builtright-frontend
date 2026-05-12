import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Services from "./pages/Services/Services";
import EnergySolutions from "./pages/EnergySolutions/EnergySolutions";
import Contact from "./pages/Contact/Contact";
import Shop from "./pages/Shop/Shop";
import CategoryProducts from "./pages/CategoryProducts/CategoryProducts";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Checkout from "./pages/Checkout/Checkout";
import FinancingForm from "./pages/FinancingForm/FinancingForm";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import Compare from "./pages/Compare/Compare";
import Auth from "./pages/Auth/Auth";

// Admin Pages
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminProducts from "./pages/AdminProducts/AdminProducts";
import AdminOrders from "./pages/AdminOrders/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers/AdminCustomers";
import AdminLoanRequests from "./pages/AdminLoanRequests/AdminLoanRequests";

// Customer Pages
import CustomerDashboard from "./pages/CustomerDashboard/CustomerDashboard";
import CustomerFinancing from "./pages/CustomerFinancing/CustomerFinancing";
import CustomerOrders from "./pages/CustomerOrders/CustomerOrders";
import CustomerProfile from "./pages/CustomerProfile/CustomerProfile";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import CartToast from "./components/CartToast/CartToast";
import ScrollToTop from "./components/ScrollToTop";
import WhatsappFloat from "./components/WhatsappFloat/WhatsappFloat";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";

// Context
import { useCart } from "./context/useCart";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cartItems } = useCart();
  const cartCount = cartItems.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />

      {!isAdminPage && (
        <Navbar
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartCount}
        />
      )}

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/energy" element={<EnergySolutions />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />

        {/* Shop Pages */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:categorySlug" element={<CategoryProducts />} />
        <Route path="/shop/:categorySlug/:productId" element={<ProductDetails />} />
        <Route path="/compare" element={<Compare />} />

        {/* Customer Protected Pages */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financing"
          element={
            <ProtectedRoute>
              <FinancingForm />
            </ProtectedRoute>
          }
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/financing"
          element={
            <ProtectedRoute>
              <CustomerFinancing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute>
              <CustomerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedAdminRoute>
              <AdminProducts />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedAdminRoute>
              <AdminOrders />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedAdminRoute>
              <AdminCustomers />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/loan-requests"
          element={
            <ProtectedAdminRoute>
              <AdminLoanRequests />
            </ProtectedAdminRoute>
          }
        />
      </Routes>

      {!isAdminPage && (
        <>
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />

          <CartToast />
          <WhatsappFloat />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;