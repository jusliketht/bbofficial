// =====================================================
// SUPPORT SERVICE
// Service for support tickets and contact
// =====================================================

import apiClient from '../../../services/core/APIClient';

class SupportService {
  constructor() {
    this.basePath = '/api/support';
  }

  /**
   * Create a support ticket
   * @param {object} ticketData - Ticket data (subject, message, category, priority, attachments)
   * @returns {Promise<Object>} Created ticket
   */
  async createTicket(ticketData) {
    try {
      const formData = new FormData();
      formData.append('subject', ticketData.subject);
      formData.append('message', ticketData.message);
      formData.append('category', ticketData.category || 'general');
      formData.append('priority', ticketData.priority || 'medium');

      if (ticketData.attachments && ticketData.attachments.length > 0) {
        ticketData.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const response = await apiClient.post(`${this.basePath}/tickets`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create support ticket');
    }
  }

  /**
   * Get user tickets
   * @param {object} filters - Filters (status, category, etc.)
   * @param {object} pagination - Pagination options
   * @returns {Promise<Object>} Tickets
   */
  async getTickets(filters = {}, pagination = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (pagination.page) params.append('page', pagination.page);
      if (pagination.limit) params.append('limit', pagination.limit || 20);

      const response = await apiClient.get(`${this.basePath}/tickets?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get tickets error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
    }
  }

  /**
   * Get ticket details
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  async getTicketDetails(ticketId) {
    try {
      const response = await apiClient.get(`${this.basePath}/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket details error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket details');
    }
  }

  /**
   * Add attachment to ticket
   * @param {string} ticketId - Ticket ID
   * @param {File} file - File to attach
   * @returns {Promise<Object>} Result
   */
  async addAttachment(ticketId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `${this.basePath}/tickets/${ticketId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      return response.data;
    } catch (error) {
      console.error('Add attachment error:', error);
      throw new Error(error.response?.data?.message || 'Failed to add attachment');
    }
  }
}

export const supportService = new SupportService();

