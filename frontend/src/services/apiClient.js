// =====================================================
// API CLIENT SERVICE - ENTERPRISE GRADE
// Centralized API communication with interceptors
// =====================================================

import axios from 'axios';
import toast from 'react-hot-toast';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
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

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const authService = (await import('./authService')).default;
            await authService.refreshToken();

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
          }
        } else if (error.response?.status === 403) {
          // Check if it's a token expiration error
          if (error.response?.data?.message?.includes('expired') || 
              error.response?.data?.code === 'AUTH_TOKEN_INVALID') {
            // Token expired, try to refresh
            if (!originalRequest._retry) {
              originalRequest._retry = true;
              try {
                const authService = (await import('./authService')).default;
                await authService.refreshToken();
                return this.client(originalRequest);
              } catch (refreshError) {
                this.clearTokens();
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
              }
            }
          } else {
            toast.error(
              'Access denied. You do not have permission to perform this action.'
            );
          }
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  // File upload method
  async uploadFile(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  }

  // Set auth token
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // Set refresh token
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Clear auth tokens (alias for clearTokens)
  clearAuthTokens() {
    this.clearTokens();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { apiClient };
