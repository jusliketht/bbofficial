// Dashboard Service - Real API Integration
// Provides comprehensive dashboard data fetching with proper error handling
// Essential for production-ready dashboard functionality

import { apiClient } from './api';

class DashboardService {
  
  // Get user dashboard summary
  async getUserDashboardSummary(userId) {
    try {
      const response = await apiClient.get('/api/dashboard/summary');
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to fetch dashboard data'
      };
    }
  }

  // Get user filings
  async getUserFilings(userId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/api/filings/user-filings?${queryParams}`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch user filings:', error);
      return {
        success: false,
        data: { filings: [], pagination: { total: 0, limit: 10, offset: 0, hasMore: false } },
        error: error.response?.data?.error || error.message || 'Failed to fetch filings'
      };
    }
  }

  // Get financial profile
  async getFinancialProfile(userId) {
    try {
      const response = await apiClient.get('/api/financial-profile');
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch financial profile:', error);
      return {
        success: false,
        data: { profile: null },
        error: error.response?.data?.error || error.message || 'Failed to fetch financial profile'
      };
    }
  }

  // Get CA assignments
  async getCAAssignments(caId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/api/dashboard/ca-assignments?${queryParams}`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch CA assignments:', error);
      return {
        success: false,
        data: { assignments: [], pagination: { total: 0, limit: 10, offset: 0, hasMore: false } },
        error: error.response?.data?.error || error.message || 'Failed to fetch CA assignments'
      };
    }
  }

  // Get platform stats (Super Admin)
  async getPlatformStats() {
    try {
      const response = await apiClient.get('/api/dashboard/platform-stats');
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
      return {
        success: false,
        data: {
          users: { total: 0, active: 0, newThisMonth: 0, regular: 0, ca: 0, growth: 0 },
          services: { total: 0, completed: 0, active: 0, pending: 0, newThisMonth: 0, growth: 0 },
          revenue: { total: 0, collected: 0, pending: 0, thisMonth: 0, growth: 0 },
          system: { uptime: 0, responseTime: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, activeConnections: 0 }
        },
        error: error.response?.data?.error || error.message || 'Failed to fetch platform stats'
      };
    }
  }

  // Get recent activity
  async getRecentActivity(userId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/api/dashboard/recent-activity?${queryParams}`);
      return {
        success: true,
        data: response.data.data || [],
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || error.message || 'Failed to fetch recent activity'
      };
    }
  }

  // Create new filing
  async createFiling(filingData) {
    try {
      const response = await apiClient.post('/api/filings', filingData);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to create filing:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to create filing'
      };
    }
  }

  // Update filing status
  async updateFilingStatus(filingId, status) {
    try {
      const response = await apiClient.patch(`/api/filings/${filingId}/status`, { status });
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to update filing status:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to update filing status'
      };
    }
  }

  // Get notifications
  async getNotifications(userId) {
    try {
      const response = await apiClient.get(`/api/notifications?userId=${userId}`);
      return {
        success: true,
        data: response.data.data || [],
        error: null
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || error.message || 'Failed to fetch notifications'
      };
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to mark notification as read'
      };
    }
  }
}

export const dashboardService = new DashboardService();
