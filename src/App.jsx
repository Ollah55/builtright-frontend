import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
const About = lazy(() => import("./pages/About/About"));
const Services = lazy(() => import("./pages/Services/Services"));
const EnergySolutions = lazy(() => import("./pages/EnergySolutions/EnergySolutions"));
const EnergyCalculatorPage = lazy(() => import("./pages/EnergyCalculatorPage/EnergyCalculatorPage"));
const SolarInstallationLagos = lazy(() => import("./pages/SolarInstallationLagos/SolarInstallationLagos"));
const SolarTrainingLagos = lazy(() => import("./pages/SolarTrainingLagos/SolarTrainingLagos"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicy"));
const Shop = lazy(() => import("./pages/Shop/Shop"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts/CategoryProducts"));
const ProductDetails = lazy(() => import("./pages/ProductDetails/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const FinancingForm = lazy(() => import("./pages/FinancingForm/FinancingForm"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess/PaymentSuccess"));
const Compare = lazy(() => import("./pages/Compare/Compare"));
const Auth = lazy(() => import("./pages/Auth/Auth"));
const ForgotPassword = lazy(() => import("./pages/PasswordRecovery/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/PasswordRecovery/ResetPassword"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/AdminLogin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/AdminOrders/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers/AdminCustomers"));
const AdminLoanRequests = lazy(() => import("./pages/AdminLoanRequests/AdminLoanRequests"));
const AdminFinancingCase = lazy(() => import("./pages/AdminFinancingCase/AdminFinancingCase"));
const AdminProjects = lazy(() => import("./pages/AdminProjects/AdminProjects"));
const AdminDevices = lazy(() => import("./pages/AdminDevices/AdminDevices"));
const AdminIntegrations = lazy(() => import("./pages/AdminIntegrations/AdminIntegrations"));
const AdminInstallers = lazy(() => import("./pages/AdminInstallers/AdminInstallers"));
const AdminTestCentre = lazy(() => import("./pages/AdminTestCentre/AdminTestCentre"));
const AdminLearners = lazy(() => import("./pages/AdminLearners/AdminLearners"));
const AdminSalesTeam = lazy(() => import("./pages/AdminSalesTeam/AdminSalesTeam"));
const InstallerLogin = lazy(() => import("./pages/InstallerLogin/InstallerLogin"));
const InstallerActivate = lazy(() => import("./pages/InstallerActivate/InstallerActivate"));
const InstallerAssignments = lazy(() => import("./pages/InstallerAssignments/InstallerAssignments"));
const LearnerLogin = lazy(() => import("./pages/LearnerLogin/LearnerLogin"));
const LearnerActivate = lazy(() => import("./pages/LearnerActivate/LearnerActivate"));
const LearnerPortal = lazy(() => import("./pages/LearnerPortal/LearnerPortal"));
const LearnerLiveClass = lazy(() => import("./pages/LearnerLiveClass/LearnerLiveClass"));
const AdminAccountant = lazy(() => import("./pages/Accounting/AdminAccountant"));
const AccountantLogin = lazy(() => import("./pages/Accounting/AccountantLogin"));
const AccountantActivate = lazy(() => import("./pages/Accounting/AccountantActivate"));
const AccountantResetPassword = lazy(() => import("./pages/Accounting/AccountantResetPassword"));
const AccountingPortal = lazy(() => import("./pages/Accounting/AccountingPortal"));
import ProtectedAccountantRoute from "./components/ProtectedAccountantRoute/ProtectedAccountantRoute";
const SalesLogin = lazy(() => import("./pages/SalesLogin/SalesLogin"));
const SalesActivate = lazy(() => import("./pages/SalesActivate/SalesActivate"));
const SalesProjects = lazy(() => import("./pages/SalesProjects/SalesProjects"));
import ProtectedSalesRoute from "./components/ProtectedSalesRoute/ProtectedSalesRoute";

// Customer Pages
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard/CustomerDashboard"));
const CustomerFinancing = lazy(() => import("./pages/CustomerFinancing/CustomerFinancing"));
const CustomerOrders = lazy(() => import("./pages/CustomerOrders/CustomerOrders"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile/CustomerProfile"));
const CustomerDocuments = lazy(() => import("./pages/CustomerDocuments/CustomerDocuments"));

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
  const isPortalPage = isAdminPage || location.pathname.startsWith("/installer") || location.pathname.startsWith("/learner") || location.pathname.startsWith("/accounting") || location.pathname.startsWith("/sales");

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

      <Suspense
        fallback={
          <div
            role="status"
            aria-live="polite"
            style={{
              minHeight: "55vh",
              display: "grid",
              placeItems: "center",
              color: "#159284",
              fontWeight: 700,
            }}
          >
            Loading...
          </div>
        }
      >
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/energy" element={<EnergySolutions />} />
        <Route path="/energy-calculator" element={<EnergyCalculatorPage />} />
        <Route path="/solar-installation-lagos" element={<SolarInstallationLagos />} />
        <Route path="/solar-training-lagos" element={<SolarTrainingLagos />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/installer/login" element={<InstallerLogin />} />
        <Route path="/installer/activate" element={<InstallerActivate />} />
        <Route path="/installer/assignments" element={<ProtectedInstallerRoute><InstallerAssignments /></ProtectedInstallerRoute>} />
        <Route path="/learner/login" element={<LearnerLogin />} />
        <Route path="/learner/activate" element={<LearnerActivate />} />
        <Route path="/learner/portal" element={<ProtectedLearnerRoute><LearnerPortal /></ProtectedLearnerRoute>} />
        <Route path="/learner/live-class" element={<ProtectedLearnerRoute><LearnerLiveClass /></ProtectedLearnerRoute>} />
        <Route path="/accounting/login" element={<AccountantLogin />} />
        <Route path="/accounting/activate" element={<AccountantActivate />} />
        <Route path="/accounting/reset-password" element={<AccountantResetPassword />} />
        <Route path="/accounting/dashboard" element={<ProtectedAccountantRoute><AccountingPortal /></ProtectedAccountantRoute>} />
        <Route path="/sales/login" element={<SalesLogin />} />
        <Route path="/sales/activate" element={<SalesActivate />} />
        <Route path="/sales/projects" element={<ProtectedSalesRoute><SalesProjects /></ProtectedSalesRoute>} />
        <Route path="/sales/projects/:id" element={<ProtectedSalesRoute><AdminFinancingCase /></ProtectedSalesRoute>} />
        <Route path="/admin/accountant" element={<ProtectedAdminRoute><AdminAccountant /></ProtectedAdminRoute>} />

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
        <Route
          path="/admin/sales-team"
          element={<ProtectedAdminRoute><AdminSalesTeam /></ProtectedAdminRoute>}
        />
      </Routes>
      </Suspense>

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
