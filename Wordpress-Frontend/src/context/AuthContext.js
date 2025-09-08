// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:5119/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
      return null;
    }
  }, [logout]);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      await fetchUserData();
      
      // Redirect based on role
      const userResponse = await axios.get(`${API_URL}/me`);
      const userData = userResponse.data;
      
      if (userData.roles.includes('Admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await axios.post(`${API_URL}/signup`, userData);
      return await login(userData.email, userData.password);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  };


  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.roles?.includes(requiredRole);
  };

  // Check if user has any of the required roles
  const hasAnyRole = (requiredRoles) => {
    if (!user) return false;
    return user.roles?.some(role => requiredRoles.includes(role));
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('Admin');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Protected Route component
  const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    if (loading) {
      return <div>Loading...</div>; // Or a loading spinner
    }

    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: location.pathname } });
      return null;
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      // Redirect to unauthorized page or home
      navigate('/unauthorized');
      return null;
    }

    return children;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        hasRole,
        hasAnyRole,
        ProtectedRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;