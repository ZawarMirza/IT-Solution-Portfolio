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
    // Skip for refresh token request to avoid infinite loop
    if (config.url === '/auth/refresh-token') {
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
    
    // If the error status is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login';
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
        const response = await refreshApi.post('/auth/refresh-token', {
          refreshToken: refreshToken
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
      } catch (error) {
        // If refresh token fails, redirect to login
        console.error('Error refreshing token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
