import { Navigate, useLocation } from "react-router-dom";

function ProtectedInstallerRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("installerToken");

  if (!token) {
    return <Navigate to="/installer/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedInstallerRoute;
