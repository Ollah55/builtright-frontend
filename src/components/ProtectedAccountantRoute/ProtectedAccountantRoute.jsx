import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedAccountantRoute({ children }) {
  const location = useLocation();
  return localStorage.getItem("accountantToken")
    ? children
    : <Navigate to="/accounting/login" state={{ from: location.pathname }} replace />;
}
