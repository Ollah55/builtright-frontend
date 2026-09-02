import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Services from "./pages/Services/Services";
import EnergySolutions from "./pages/EnergySolutions/EnergySolutions";
import SolarInstallationLagos from "./pages/SolarInstallationLagos/SolarInstallationLagos";
import SolarTrainingLagos from "./pages/SolarTrainingLagos/SolarTrainingLagos";
import Contact from "./pages/Contact/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
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
import AdminFinancingCase from "./pages/AdminFinancingCase/AdminFinancingCase";
import AdminProjects from "./pages/AdminProjects/AdminProjects";
import AdminDevices from "./pages/AdminDevices/AdminDevices";
import AdminIntegrations from "./pages/AdminIntegrations/AdminIntegrations";
import AdminInstallers from "./pages/AdminInstallers/AdminInstallers";
import AdminTestCentre from "./pages/AdminTestCentre/AdminTestCentre";
import AdminLearners from "./pages/AdminLearners/AdminLearners";
import InstallerLogin from "./pages/InstallerLogin/InstallerLogin";
import InstallerActivate from "./pages/InstallerActivate/InstallerActivate";
import InstallerAssignments from "./pages/InstallerAssignments/InstallerAssignments";
import LearnerLogin from "./pages/LearnerLogin/LearnerLogin";
import LearnerActivate from "./pages/LearnerActivate/LearnerActivate";
import LearnerPortal from "./pages/LearnerPortal/LearnerPortal";
import LearnerLiveClass from "./pages/LearnerLiveClass/LearnerLiveClass";

// Customer Pages
import CustomerDashboard from "./pages/CustomerDashboard/CustomerDashboard";
import CustomerFinancing from "./pages/CustomerFinancing/CustomerFinancing";
import CustomerOrders from "./pages/CustomerOrders/CustomerOrders";
import CustomerProfile from "./pages/CustomerProfile/CustomerProfile";
import CustomerDocuments from "./pages/CustomerDocuments/CustomerDocuments";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import CartToast from "./components/CartToast/CartToast";
import ScrollToTop from "./components/ScrollToTop";
import WhatsappFloat from "./components/WhatsappFloat/WhatsappFloat";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
import ProtectedInstallerRoute from "./components/ProtectedInstallerRoute/ProtectedInstallerRoute";
import ProtectedLearnerRoute from "./components/ProtectedLearnerRoute/ProtectedLearnerRoute";
import SiteSeo from "./components/SiteSeo/SiteSeo";

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
  const isPortalPage = isAdminPage || location.pathname.startsWith("/installer") || location.pathname.startsWith("/learner");

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
      <SiteSeo pathname={location.pathname} />

      {!isPortalPage && (
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
        <Route path="/solar-installation-lagos" element={<SolarInstallationLagos />} />
        <Route path="/solar-training-lagos" element={<SolarTrainingLagos />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
          path="/customer/documents"
          element={
            <ProtectedRoute>
              <CustomerDocuments />
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
        <Route path="/installer/login" element={<InstallerLogin />} />
        <Route path="/installer/activate" element={<InstallerActivate />} />
        <Route path="/installer/assignments" element={<ProtectedInstallerRoute><InstallerAssignments /></ProtectedInstallerRoute>} />
        <Route path="/learner/login" element={<LearnerLogin />} />
        <Route path="/learner/activate" element={<LearnerActivate />} />
        <Route path="/learner/portal" element={<ProtectedLearnerRoute><LearnerPortal /></ProtectedLearnerRoute>} />
        <Route path="/learner/live-class" element={<ProtectedLearnerRoute><LearnerLiveClass /></ProtectedLearnerRoute>} />

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

        <Route
          path="/admin/loan-requests/:id"
          element={
            <ProtectedAdminRoute>
              <AdminFinancingCase />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/projects"
          element={
            <ProtectedAdminRoute>
              <AdminProjects />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/devices"
          element={
            <ProtectedAdminRoute>
              <AdminDevices />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/integrations"
          element={
            <ProtectedAdminRoute>
              <AdminIntegrations />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/test-centre"
          element={<ProtectedAdminRoute><AdminTestCentre /></ProtectedAdminRoute>}
        />

        <Route
          path="/admin/installers"
          element={<ProtectedAdminRoute><AdminInstallers /></ProtectedAdminRoute>}
        />

        <Route
          path="/admin/learners"
          element={<ProtectedAdminRoute><AdminLearners /></ProtectedAdminRoute>}
        />
      </Routes>

      {!isPortalPage && (
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
