// =====================================================
// AUTHENTICATION SERVICE
// =====================================================

import apiClient from './apiClient';
import { enterpriseLogger } from '../utils/logger';

class AuthService {
  constructor() {
    this.basePath = '/auth';
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(`${this.basePath}/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Store tokens
        apiClient.setAuthToken(response.data.accessToken);
        if (response.data.refreshToken) {
          apiClient.setRefreshToken(response.data.refreshToken);
        }

        // Store user info
        this.setUserInfo(response.data.user);

        enterpriseLogger.info('User logged in successfully', {
          userId: response.data.user.id,
          email: response.data.user.email
        });
      }

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Login error', {
        email,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await apiClient.post(`${this.basePath}/register`, userData);

      if (response.data.success) {
        enterpriseLogger.info('User registered successfully', {
          userId: response.data.user.id,
          email: response.data.user.email
        });
      }

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Registration error', {
        email: userData.email,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      const response = await apiClient.post(`${this.basePath}/logout`);

      // Clear tokens and user info
      apiClient.clearAuthTokens();
      this.clearUserInfo();

      enterpriseLogger.info('User logged out successfully');

      return response;
    } catch (error) {
      enterpriseLogger.error('Logout error', {
        error: error.message
      });
      
      // Clear tokens even if logout fails
      apiClient.clearAuthTokens();
      this.clearUserInfo();
      
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken() {
    try {
      const refreshToken = apiClient.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(`${this.basePath}/refresh`, {
        refreshToken
      });

      if (response.data.success) {
        apiClient.setAuthToken(response.data.accessToken);
        // Update stored user info
        this.setUserInfo(response.data.user);
      }

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Refresh token error', {
        error: error.message
      });
      
      // Clear tokens on refresh failure
      apiClient.clearAuthTokens();
      this.clearUserInfo();
      
      throw error;
    }
  }

  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const response = await apiClient.post(`${this.basePath}/verify-email`, {
        token
      });

      return response;
    } catch (error) {
      enterpriseLogger.error('Email verification error', {
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} Resend result
   */
  async resendVerificationEmail(email) {
    try {
      const response = await apiClient.post(`${this.basePath}/resend-verification`, {
        email
      });

      return response;
    } catch (error) {
      enterpriseLogger.error('Resend verification email error', {
        email,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Promise<Object>} Forgot password result
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(`${this.basePath}/forgot-password`, {
        email
      });

      return response;
    } catch (error) {
      enterpriseLogger.error('Forgot password error', {
        email,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Validate reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Validation result
   */
  async validateResetToken(token) {
    try {
      const response = await apiClient.post(`${this.basePath}/validate-reset-token`, {
        token
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Validate reset token error', {
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(`${this.basePath}/reset-password`, {
        token,
        newPassword
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Reset password error', {
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change result
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post(`${this.basePath}/change-password`, {
        currentPassword,
        newPassword
      });

      return response;
    } catch (error) {
      enterpriseLogger.error('Change password error', {
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get(`${this.basePath}/profile`);

      return response.data.user;
    } catch (error) {
      enterpriseLogger.error('Get profile error', {
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(`${this.basePath}/profile`, profileData);

      if (response.success) {
        // Update stored user info
        this.setUserInfo(response.user);
      }

      return response;
    } catch (error) {
      enterpriseLogger.error('Update profile error', {
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Send OTP for MFA
   * @param {string} method - OTP method (sms, email)
   * @returns {Promise<Object>} OTP result
   */
  async sendOTP(method = 'sms') {
    try {
      const response = await apiClient.post(`${this.basePath}/send-otp`, {
        method
      });

      return response;
    } catch (error) {
      enterpriseLogger.error('Send OTP error', {
        method,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Verify OTP
   * @param {string} otp - OTP code
   * @param {string} method - OTP method
   * @returns {Promise<Object>} Verification result
   */
  async verifyOTP(otp, method = 'sms') {
    try {
      const response = await apiClient.post(`${this.basePath}/verify-otp`, {
        otp,
        method
      });

      return response;
    } catch (error) {
      enterpriseLogger.error('Verify OTP error', {
        method,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = apiClient.getAuthToken();
    const userInfo = this.getUserInfo();
    return !!(token && userInfo);
  }

  /**
   * Get current user info from storage
   * @returns {Object|null} User info
   */
  getUserInfo() {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      enterpriseLogger.error('Get user info error', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Set user info in storage
   * @param {Object} userInfo - User info
   */
  setUserInfo(userInfo) {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
      enterpriseLogger.error('Set user info error', {
        error: error.message
      });
    }
  }

  /**
   * Clear user info from storage
   */
  clearUserInfo() {
    try {
      localStorage.removeItem('userInfo');
    } catch (error) {
      enterpriseLogger.error('Clear user info error', {
        error: error.message
      });
    }
  }

  /**
   * Get user role
   * @returns {string|null} User role
   */
  getUserRole() {
    const userInfo = this.getUserInfo();
    return userInfo?.role || null;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Has role
   */
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Roles to check
   * @returns {boolean} Has any role
   */
  hasAnyRole(roles) {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  /**
   * Get service status
   * @returns {Object} Service status
   */
  getServiceStatus() {
    return {
      basePath: this.basePath,
      isAuthenticated: this.isAuthenticated(),
      hasUserInfo: !!this.getUserInfo(),
      apiClientStatus: apiClient.getServiceStatus()
    };
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;