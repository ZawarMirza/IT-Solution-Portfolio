import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../context";

// Default session timeout (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;
// Time before session expires to refresh token (5 minutes)
const REFRESH_THRESHOLD = 5 * 60 * 1000;
// Time to show session expiration warning (2 minutes before timeout)
const WARNING_THRESHOLD = 2 * 60 * 1000;

export const useSession = () => {
  const { user, token, refreshToken, login, logout } = useAuth();
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  let timeoutId = null;
  let intervalId = null;

  const clearTimers = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, [timeoutId, intervalId]);

  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      // Call your refresh token endpoint
      const response = await fetch('http://localhost:5119/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }

      const { token: newToken, refreshToken: newRefreshToken, expiresIn } = await response.json();
      
      // Update auth context with new tokens
      login({
        token: newToken,
        refreshToken: newRefreshToken,
        user: user, // Keep the existing user data
      });

      // Reset session expiration
      const expiresAt = Date.now() + (expiresIn || SESSION_TIMEOUT);
      setSessionExpiresAt(expiresAt);
      setShowWarning(false);
      
      return expiresAt;
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
      return null;
    }
  }, [refreshToken, user, login, logout]);

  const startSessionTimer = useCallback((expiresAt) => {
    if (!expiresAt) return;

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Clear any existing timers
    clearTimers();

    // Set timeout for session expiration
    timeoutId = setTimeout(() => {
      logout();
    }, timeUntilExpiry);

    // Set interval to check for refresh or warning
    intervalId = setInterval(() => {
      const timeLeft = expiresAt - Date.now();
      setTimeRemaining(Math.max(0, Math.floor(timeLeft / 1000)));

      // Show warning when time is running out
      if (timeLeft <= WARNING_THRESHOLD) {
        setShowWarning(true);
      }

      // Refresh token when close to expiration
      if (timeLeft <= REFRESH_THRESHOLD) {
        refreshSession();
      }
    }, 1000);
  }, [clearTimers, logout, refreshSession]);

  // Initialize session timer on mount or when tokens change
  useEffect(() => {
    if (!token || !user) {
      clearTimers();
      return;
    }

    // Calculate expiration time
    const tokenExpiresAt = user.exp ? user.exp * 1000 : Date.now() + SESSION_TIMEOUT;
    setSessionExpiresAt(tokenExpiresAt);
    startSessionTimer(tokenExpiresAt);

    // Clean up on unmount
    return () => {
      clearTimers();
    };
  }, [token, user, startSessionTimer, clearTimers]);

  // Handle user activity to extend session
  const extendSession = useCallback(() => {
    if (!sessionExpiresAt) return;
    
    const timeLeft = sessionExpiresAt - Date.now();
    
    // Only extend if we're getting close to expiration
    if (timeLeft < REFRESH_THRESHOLD) {
      refreshSession();
    } else if (showWarning) {
      // If warning is showing but we have time left, hide the warning
      setShowWarning(false);
    }
  }, [sessionExpiresAt, showWarning, refreshSession]);

  // Listen for user activity to extend session
  useEffect(() => {
    if (!token) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => extendSession();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [token, extendSession]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isAuthenticated: !!token,
    sessionExpiresAt,
    showWarning,
    timeRemaining: formatTimeRemaining(timeRemaining),
    extendSession,
    refreshSession,
  };
};

export default useSession;
