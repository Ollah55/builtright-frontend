import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("customerToken");

  if (!token) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;