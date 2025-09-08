// src/components/ProtectedRoute.js
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const { ProtectedRoute: AuthProtectedRoute } = useAuth();
  return <AuthProtectedRoute requiredRoles={requiredRoles}>{children}</AuthProtectedRoute>;
}

export default ProtectedRoute;