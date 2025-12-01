// =====================================================
// TAX PAYMENT SERVICE
// Frontend service for tax payment operations
// =====================================================

import apiClient from '../../../services/core/APIClient';

class TaxPaymentService {
  /**
   * Generate challan
   * @param {string} filingId - Filing ID
   * @param {object} challanData - Challan data
   * @returns {Promise<object>} - Generated challan details
   */
  async generateChallan(filingId, challanData) {
    try {
      const response = await apiClient.post(
        `/api/itr/filings/${filingId}/taxes-paid/challan`,
        challanData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to generate challan:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to generate challan',
      };
    }
  }

  /**
   * Create Razorpay payment order
   * @param {string} filingId - Filing ID
   * @param {string} paymentId - Tax payment ID
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} - Razorpay order details
   */
  async createPaymentOrder(filingId, paymentId, paymentData = {}) {
    try {
      const response = await apiClient.post('/api/payments/tax/create-order', {
        filingId,
        paymentId,
        ...paymentData,
      });
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to create payment order:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create payment order',
      };
    }
  }

  /**
   * Initiate ITD payment
   * @param {string} filingId - Filing ID
   * @param {string} paymentId - Tax payment ID
   * @returns {Promise<object>} - ITD payment URL
   */
  async initiateITDPayment(filingId, paymentId) {
    try {
      const response = await apiClient.post('/api/payments/tax/itd/initiate', {
        filingId,
        paymentId,
      });
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to initiate ITD payment:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to initiate ITD payment',
      };
    }
  }

  /**
   * Verify payment
   * @param {string} paymentId - Tax payment ID
   * @param {object} verificationData - Verification data
   * @returns {Promise<object>} - Verification result
   */
  async verifyPayment(paymentId, verificationData) {
    try {
      const response = await apiClient.post('/api/payments/tax/verify', {
        paymentId,
        ...verificationData,
      });
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to verify payment:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to verify payment',
      };
    }
  }

  /**
   * Upload payment proof
   * @param {string} paymentId - Tax payment ID
   * @param {string} fileUrl - URL of uploaded file
   * @returns {Promise<object>} - Upload result
   */
  async uploadPaymentProof(paymentId, fileUrl) {
    try {
      const response = await apiClient.post(`/api/payments/tax/${paymentId}/proof`, {
        proofUrl: fileUrl,
      });
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to upload payment proof:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to upload payment proof',
      };
    }
  }

  /**
   * Verify payment via Form 26AS
   * @param {string} paymentId - Tax payment ID
   * @returns {Promise<object>} - Verification result
   */
  async verifyVia26AS(paymentId) {
    try {
      const response = await apiClient.post(`/api/payments/tax/${paymentId}/verify-26as`);
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to verify via 26AS:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to verify via 26AS',
      };
    }
  }

  /**
   * Get payment status
   * @param {string} paymentId - Tax payment ID
   * @returns {Promise<object>} - Payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await apiClient.get(`/api/payments/tax/${paymentId}/status`);
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get payment status',
      };
    }
  }

  /**
   * Get payment history for a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} - Payment history
   */
  async getPaymentHistory(filingId) {
    try {
      const response = await apiClient.get(`/api/payments/tax/filing/${filingId}/history`);
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get payment history',
        payments: [],
        totalPaid: 0,
      };
    }
  }
}

export default new TaxPaymentService();

