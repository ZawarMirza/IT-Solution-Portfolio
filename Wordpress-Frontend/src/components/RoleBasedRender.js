// src/components/RoleBasedRender.js
import { useAuth } from '../context/AuthContext';

const RoleBasedRender = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return null;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = user?.roles?.some(role => 
    allowedRoles.includes(role)
  );

  if (!hasRequiredRole) {
    return null;
  }

  return children;
};

export default RoleBasedRender;