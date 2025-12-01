// =====================================================
// DRAFT SERVICE
// API service for draft management
// =====================================================

import apiClient from '../../../services/core/APIClient';

class DraftService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get version history
   */
  async getVersionHistory(filingId, draftType) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/drafts/${filingId}/history?type=${draftType}`,
      );
      return response.data.history || [];
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }

  /**
   * Restore version
   */
  async restoreVersion(filingId, versionId) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/drafts/${filingId}/restore`,
        { versionId },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to restore version:', error);
      throw new Error(error.response?.data?.message || 'Failed to restore version');
    }
  }

  /**
   * Export draft as PDF
   */
  async exportAsPDF(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/drafts/${filingId}/export/pdf`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw new Error(error.response?.data?.message || 'Failed to export PDF');
    }
  }

  /**
   * Share draft for CA review
   * @param {string} filingId - Filing ID
   * @param {string} recipientEmail - Recipient email address
   * @param {string} message - Optional message to include
   * @returns {Promise<object>} Share result
   */
  async shareDraft(filingId, recipientEmail, message = null) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/drafts/${filingId}/share`,
        { 
          recipientEmail,
          caEmail: recipientEmail, // Support both for backward compatibility
          message,
        },
      );
      return {
        success: true,
        shareLink: response.data.shareLink,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to share draft:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to share draft');
    }
  }
}

export const draftService = new DraftService();

