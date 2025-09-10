import React from 'react';
import { useAuth } from '../context';

const GuestRoute = ({ children, fallback = null }) => {
  const { isGuest } = useAuth();

  // Only render children if user is a guest (not authenticated)
  if (isGuest()) {
    return children;
  }

  // If authenticated, render fallback or nothing
  return fallback;
};

export default GuestRoute;
