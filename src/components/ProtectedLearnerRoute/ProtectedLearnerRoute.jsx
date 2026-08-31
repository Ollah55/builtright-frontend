import { Navigate, useLocation } from "react-router-dom";

function ProtectedLearnerRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("learnerToken");

  if (!token) {
    return <Navigate to="/learner/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedLearnerRoute;
