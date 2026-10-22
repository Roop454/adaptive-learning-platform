import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

// Redirects to the login page when there is no signed-in user.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
