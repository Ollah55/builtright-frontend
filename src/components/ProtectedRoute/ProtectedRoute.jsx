import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isDevelopmentPreview } from "../../lib/previewMode";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("customerToken");
  const isLocalPreview = isDevelopmentPreview(location.search);

  if (!token && !isLocalPreview) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
