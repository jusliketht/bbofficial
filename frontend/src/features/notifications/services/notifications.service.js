// =====================================================
// NOTIFICATIONS SERVICE
// Service for managing user notifications
// =====================================================

import apiClient from '../../../services/core/APIClient';

class NotificationsService {
  constructor() {
    this.basePath = '/api/notifications';
  }

  /**
   * Get all notifications for the current user
   * @param {object} filters - Filter options (type, read, etc.)
   * @param {object} pagination - Pagination options (page, limit)
   * @returns {Promise<object>} Notifications list with pagination
   */
  async getNotifications(filters = {}, pagination = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters
      if (filters.type) params.append('type', filters.type);
      if (filters.read !== undefined) params.append('read', filters.read);
      // Add pagination
      if (pagination.page) params.append('page', pagination.page);
      if (pagination.limit) params.append('limit', pagination.limit || 20);

      const response = await apiClient.get(
        `${this.basePath}?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get(`${this.basePath}/unread-count`);
      return response.data?.count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<object>} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.put(`${this.basePath}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw new Error(error.response?.data?.error || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark notification as unread
   * @param {string} notificationId - Notification ID
   * @returns {Promise<object>} Updated notification
   */
  async markAsUnread(notificationId) {
    try {
      const response = await apiClient.put(`${this.basePath}/${notificationId}/unread`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      throw new Error(error.response?.data?.error || 'Failed to mark notification as unread');
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<object>} Success response
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.put(`${this.basePath}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw new Error(error.response?.data?.error || 'Failed to mark all as read');
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<object>} Success response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(`${this.basePath}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete notification');
    }
  }

  /**
   * Delete all notifications
   * @returns {Promise<object>} Success response
   */
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete(`${this.basePath}/all`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete all notifications');
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;

