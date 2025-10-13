// API Service with Axios Interceptors
// Handles automatic token management and error handling

import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002',
  timeout: 10000,
  withCredentials: true, // Include HttpOnly cookies in all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors globally with automatic token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // CRITICAL FIX: Prevent infinite loop by not refreshing refresh requests
    if (error.response?.status === 401 && originalRequest.url.includes('/auth/refresh')) {
      console.log('Refresh token is invalid, forcing logout');
      // Clear auth data immediately
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // CRITICAL FIX: Prevent infinite loop by not refreshing logout requests
    if (error.response?.status === 401 && originalRequest.url.includes('/auth/logout')) {
      console.log('Logout failed, but clearing local data anyway');
      // Clear auth data immediately
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token using HttpOnly cookie
        const refreshResponse = await api.post('/api/auth/refresh', {});
        
        if (refreshResponse.data.success) {
          // Update access token in localStorage
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          
          // Update user data if provided
          if (refreshResponse.data.user) {
            localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed, redirecting to login');
        
        // Clear auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;