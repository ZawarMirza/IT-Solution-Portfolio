import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
  GUEST: 'Guest'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Set up response interceptor for token refresh
      const interceptor = axios.interceptors.response.use(
        response => response,
        async error => {
          const originalRequest = error.config;
          
          // If error is 401 and we haven't already tried to refresh
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const { token: newToken, refreshToken: newRefreshToken } = await refreshAuthToken();
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            } catch (refreshError) {
              // If refresh fails, log the user out
              logout();
              return Promise.reject(refreshError);
            }
          }
          
          return Promise.reject(error);
        }
      );
      
      return () => {
        axios.interceptors.response.eject(interceptor);
      };
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post('http://localhost:5119/api/auth/refresh-token', {
        token: refreshToken
      });
      
      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
      
      // Update tokens in state and localStorage
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      throw error;
    }
  }, [refreshToken]);

  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      // Only send email and password to the backend
      const { email, password } = credentials;
      const response = await axios.post('http://localhost:5119/api/auth/login', {
        email,
        password
      });
      
      const { token: authToken, refreshToken: newRefreshToken, user: userData } = response.data;
      
      // Update state
      setUser(userData);
      setToken(authToken);
      setRefreshToken(newRefreshToken);
      
      // Store in localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      // Redirect based on role or intended URL
      const from = location.state?.from?.pathname || 
                 (userData.role === ROLES.ADMIN ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    }
  }, [navigate, location.state]);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      // Add confirmPassword field to match backend expectations
      const registrationData = {
        ...userData,
        confirmPassword: userData.password
      };
      const response = await axios.post('http://localhost:5119/api/auth/register', registrationData);
      
      // Auto-login after registration if needed
      if (response.data.token) {
        const { token: authToken, refreshToken: newRefreshToken, user: userData } = response.data;
        
        setUser(userData);
        setToken(authToken);
        setRefreshToken(newRefreshToken);
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        // Redirect based on role or intended URL
        const from = location.state?.from?.pathname || 
                   (userData.role === ROLES.ADMIN ? '/admin' : '/dashboard');
        navigate(from, { replace: true });
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.response?.data || 'Registration failed. Please try again.');
      throw error;
    }
  }, [navigate, location.state]);

  const logout = useCallback(() => {
    // Clear state
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirect to main website
    navigate('/');
  }, [navigate]);

  // Check if user has any of the required roles
  const hasRole = useCallback((requiredRoles) => {
    if (!user || !user.role) return false;
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    return requiredRoles.some(role => user.role === role);
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole(ROLES.ADMIN);
  }, [hasRole]);

  // Check if user is regular user
  const isUser = useCallback(() => {
    return hasRole([ROLES.USER, ROLES.ADMIN]);
  }, [hasRole]);

  // Check if user is guest (not authenticated)
  const isGuest = useCallback(() => {
    return !user || !token;
  }, [user, token]);

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated,
    isAdmin,
    isUser,
    isGuest,
    refreshAuthToken,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
