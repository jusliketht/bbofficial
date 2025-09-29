import { apiClient } from './apiClient';

const BANK_DETAILS_ENDPOINTS = {
  GET_BANK_DETAILS: '/user/bank-details',
  UPDATE_BANK_DETAILS: '/user/bank-details',
  DELETE_BANK_DETAILS: '/user/bank-details',
  VERIFY_BANK_DETAILS: '/user/bank-details/verify'
};

export const bankDetailsService = {
  // Get user's bank details
  getBankDetails: async (userId) => {
    try {
      const response = await apiClient.get(`${BANK_DETAILS_ENDPOINTS.GET_BANK_DETAILS}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bank details:', error);
      throw error;
    }
  },

  // Update bank details
  updateBankDetails: async (userId, bankDetails) => {
    try {
      const response = await apiClient.put(`${BANK_DETAILS_ENDPOINTS.UPDATE_BANK_DETAILS}/${userId}`, bankDetails);
      return response.data;
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  },

  // Delete bank details
  deleteBankDetails: async (userId) => {
    try {
      const response = await apiClient.delete(`${BANK_DETAILS_ENDPOINTS.DELETE_BANK_DETAILS}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting bank details:', error);
      throw error;
    }
  },

  // Verify bank details
  verifyBankDetails: async (userId, verificationData) => {
    try {
      const response = await apiClient.post(`${BANK_DETAILS_ENDPOINTS.VERIFY_BANK_DETAILS}/${userId}`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying bank details:', error);
      throw error;
    }
  }
};

export default bankDetailsService;