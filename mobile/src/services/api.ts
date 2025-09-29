// =====================================================
// MOBILE API SERVICE
// Cross-platform API client for mobile apps
// =====================================================

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// =====================================================
// CONFIGURATION
// =====================================================
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3002/api' 
  : 'https://api.burnblack.com/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@burnblack_access_token',
  REFRESH_TOKEN: '@burnblack_refresh_token',
  DEVICE_ID: '@burnblack_device_id',
};

// =====================================================
// API CLIENT CLASS
// =====================================================
class MobileApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // =====================================================
  // REQUEST INTERCEPTOR
  // =====================================================
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add device ID to all requests
        const deviceId = await this.getDeviceId();
        config.headers['X-Device-ID'] = deviceId;
        config.headers['X-Platform'] = 'mobile';
        config.headers['X-App-Version'] = '1.0.0';

        // Add auth token
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Check network connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          throw new Error('No internet connection');
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // =====================================================
  // TOKEN MANAGEMENT
  // =====================================================
  private async refreshToken(): Promise<string> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
      
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async logout() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  }

  // =====================================================
  // DEVICE MANAGEMENT
  // =====================================================
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // =====================================================
  // HTTP METHODS
  // =====================================================
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  // =====================================================
  // FILE UPLOAD
  // =====================================================
  async uploadFile(url: string, file: any, onProgress?: (progress: number) => void): Promise<AxiosResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // =====================================================
  // OFFLINE SUPPORT
  // =====================================================
  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  // =====================================================
  // ERROR HANDLING
  // =====================================================
  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // =====================================================
  // PUBLIC API METHODS
  // =====================================================
  
  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await this.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: any) {
    try {
      const response = await this.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.post('/auth/logout');
      await this.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // User Management
  async getProfile() {
    try {
      const response = await this.get('/users/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData: any) {
    try {
      const response = await this.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mobile-specific endpoints
  async registerDevice(deviceData: any) {
    try {
      const response = await this.post('/mobile/device/register', deviceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async registerPushToken(tokenData: any) {
    try {
      const response = await this.post('/mobile/notifications/register', tokenData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadDocument(file: any, onProgress?: (progress: number) => void) {
    try {
      const response = await this.uploadFile('/mobile/upload/documents', file, onProgress);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async syncOfflineData(syncData: any) {
    try {
      const response = await this.post('/mobile/sync/upload', syncData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadSyncData(lastSyncTime?: string) {
    try {
      const params = lastSyncTime ? { lastSyncTime } : {};
      const response = await this.get('/mobile/sync/download', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// =====================================================
// EXPORT SINGLETON INSTANCE
// =====================================================
export const api = new MobileApiClient();
export default api;
