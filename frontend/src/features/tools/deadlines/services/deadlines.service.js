// =====================================================
// DEADLINES SERVICE
// Frontend API service for deadlines and reminders
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class DeadlinesService {
  constructor() {
    this.basePath = '/api/tools';
  }

  /**
   * Get deadlines
   */
  async getDeadlines(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.year) {
        params.append('year', options.year);
      }
      if (options.type) {
        params.append('type', options.type);
      }

      const response = await apiClient.get(
        `${this.basePath}/deadlines?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get deadlines:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get deadlines');
    }
  }

  /**
   * Create reminder
   */
  async createReminder(deadlineId, reminderDays) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/deadlines/reminders`,
        { deadlineId, reminderDays },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create reminder:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to create reminder');
    }
  }

  /**
   * Update reminder
   */
  async updateReminder(reminderId, updateData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/deadlines/reminders/${reminderId}`,
        updateData,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update reminder:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to update reminder');
    }
  }

  /**
   * Delete reminder
   */
  async deleteReminder(reminderId) {
    try {
      const response = await apiClient.delete(
        `${this.basePath}/deadlines/reminders/${reminderId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete reminder');
    }
  }
}

export const deadlinesService = new DeadlinesService();

