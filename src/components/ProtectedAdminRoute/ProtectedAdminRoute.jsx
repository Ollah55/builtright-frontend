import { Navigate, useLocation } from "react-router-dom";
import { isDevelopmentPreview } from "../../lib/previewMode";

const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("builtright_admin_token");
  const isLocalPreview = isDevelopmentPreview(location.search);

  if (!token && !isLocalPreview) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
