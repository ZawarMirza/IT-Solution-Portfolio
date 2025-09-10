import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context";

const ProtectedRoute = ({ children, requiredRoles = [], redirectTo = '/login' }) => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // If still loading auth state, show loading or null
  if (isAuthenticated === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    // If user is authenticated but doesn't have the required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If authenticated and has required role, render children
  return children;
};

export default ProtectedRoute;
