// =====================================================
// REFUND SERVICE
// API service for refund tracking
// =====================================================

import apiClient from '../../../services/core/APIClient';

class RefundService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get refund status for a filing
   */
  async getRefundStatus(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/refund/status`,
      );
      return {
        success: true,
        ...response.data.refund,
      };
    } catch (error) {
      console.error('Failed to get refund status:', error);
      throw new Error(error.response?.data?.message || 'Failed to get refund status');
    }
  }

  /**
   * Get refund history for a user
   */
  async getRefundHistory(userId, assessmentYear = null) {
    try {
      const params = assessmentYear ? `?assessmentYear=${assessmentYear}` : '';
      const response = await apiClient.get(
        `${this.basePath}/refunds/history${params}`,
      );
      return {
        success: true,
        refunds: response.data.refunds || [],
      };
    } catch (error) {
      console.error('Failed to get refund history:', error);
      throw new Error(error.response?.data?.message || 'Failed to get refund history');
    }
  }

  /**
   * Update refund bank account
   */
  async updateRefundAccount(filingId, bankAccount) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/refund/update-account`,
        bankAccount,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update refund account:', error);
      throw new Error(error.response?.data?.message || 'Failed to update refund account');
    }
  }

  /**
   * Request refund re-issue
   */
  async requestRefundReissue(filingId, reason) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/refund/reissue-request`,
        { reason },
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to request refund re-issue:', error);
      throw new Error(error.response?.data?.message || 'Failed to request refund re-issue');
    }
  }
}

export const refundService = new RefundService();

