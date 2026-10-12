import { Navigate, useLocation } from "react-router-dom";

function ProtectedSalesRoute({ children }) {
  const location = useLocation();
  if (!localStorage.getItem("salesToken")) {
    return <Navigate to="/sales/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export default ProtectedSalesRoute;
