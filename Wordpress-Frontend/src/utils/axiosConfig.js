import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5119/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Skip adding auth token for these endpoints (they don't require authentication)
    const publicEndpoints = ['/auth/refresh-token', '/auth/verify-email', '/auth/register', '/auth/login', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (isPublicEndpoint) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For file uploads, let the browser set the content-type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't redirect on 403 (Forbidden) - let the component handle it
    // 403 means the user is authenticated but doesn't have permission
    if (error.response && error.response.status === 403) {
      console.warn('403 Forbidden - User authenticated but lacks permission:', error.response.data);
      return Promise.reject(error);
    }
    
    // If the error status is 401 and we haven't tried to refresh the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, but don't redirect immediately
          // Let the component handle the error
          console.warn('No refresh token available for 401 error');
          return Promise.reject(error);
        }
        
        // Create a new axios instance without interceptors to prevent infinite loops
        const refreshApi = axios.create({
          baseURL: 'http://localhost:5119/api',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Make refresh token request
        // Backend expects "Token" (capital T) in the request body
        const response = await refreshApi.post('/auth/refresh-token', {
          Token: refreshToken
        });
        
        if (!response.data || !response.data.token) {
          throw new Error('Invalid response from refresh token endpoint');
        }
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens in localStorage
        localStorage.setItem('token', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, log but don't redirect immediately
        // Let the component handle the error
        console.error('Error refreshing token:', refreshError);
        console.error('Refresh error response:', refreshError.response?.data);
        // Only redirect if it's a network error or critical failure
        if (!refreshError.response || refreshError.response.status === 401) {
          // Token refresh endpoint itself returned 401 - token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
