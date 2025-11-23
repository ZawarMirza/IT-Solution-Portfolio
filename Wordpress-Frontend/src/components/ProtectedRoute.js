import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context";

const ProtectedRoute = ({ children, requiredRoles = [], redirectTo = '/login' }) => {
  const { user, token, isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show loading
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Check authentication - token is the primary indicator
  const hasToken = !!token || !!localStorage.getItem('token');
  const hasUser = !!user || !!localStorage.getItem('user');
  
  // If not authenticated, redirect to login with return URL
  if (!hasToken) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // If we have a token but no user yet, wait a bit for AuthContext to load it
  if (hasToken && !hasUser && !user) {
    // Give AuthContext time to load user from localStorage
    return <div className="flex items-center justify-center min-h-screen">Loading user data...</div>;
  }
  
  // Use isAuthenticated if available, otherwise check token and user directly
  if (isAuthenticated && !isAuthenticated()) {
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
