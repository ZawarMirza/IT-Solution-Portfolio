import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context';

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isAdmin, isUser, isGuest } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (isUser()) {
    return <Navigate to="/user/profile" replace />;
  } else {
    // Fallback for any edge cases
    return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;
