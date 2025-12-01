// =====================================================
// E-VERIFICATION SERVICE
// Frontend service for E-verification API calls
// =====================================================

import apiClient from './core/APIClient';

class EVerificationService {
  /**
   * Send Aadhaar OTP
   * @param {string} draftId - Draft ID
   * @param {string} aadhaarNumber - Aadhaar number (masked)
   * @returns {Promise<object>} - OTP sent status
   */
  async sendAadhaarOTP(draftId, aadhaarNumber) {
    try {
      const response = await apiClient.post(`/itr/drafts/${draftId}/everify/aadhaar`, {
        aadhaarNumber,
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to send Aadhaar OTP:', error);
      throw error;
    }
  }

  /**
   * Verify Aadhaar OTP
   * @param {string} draftId - Draft ID
   * @param {string} aadhaarNumber - Aadhaar number
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<object>} - Verification result
   */
  async verifyAadhaarOTP(draftId, aadhaarNumber, otp) {
    try {
      const response = await apiClient.post(`/itr/drafts/${draftId}/everify/aadhaar/verify`, {
        aadhaarNumber,
        otp,
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to verify Aadhaar OTP:', error);
      throw error;
    }
  }

  /**
   * Verify using Net Banking
   * @param {string} draftId - Draft ID
   * @param {object} bankDetails - Bank details
   * @param {object} credentials - Net banking credentials
   * @returns {Promise<object>} - Verification result
   */
  async verifyNetBanking(draftId, bankDetails, credentials) {
    try {
      const response = await apiClient.post(`/itr/drafts/${draftId}/everify/netbanking`, {
        bankDetails,
        credentials,
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to verify Net Banking:', error);
      throw error;
    }
  }

  /**
   * Verify using Digital Signature Certificate (DSC)
   * @param {string} draftId - Draft ID
   * @param {object} dscDetails - DSC certificate details
   * @returns {Promise<object>} - Verification result
   */
  async verifyDSC(draftId, dscDetails) {
    try {
      const response = await apiClient.post(`/itr/drafts/${draftId}/everify/dsc`, {
        dscDetails,
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to verify DSC:', error);
      throw error;
    }
  }

  /**
   * Get verification status for a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} - Verification status
   */
  async getVerificationStatus(filingId) {
    try {
      const response = await apiClient.get(`/itr/filings/${filingId}/verification`);

      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get verification status:', error);
      throw error;
    }
  }
}

export default new EVerificationService();

