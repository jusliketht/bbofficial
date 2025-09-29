import { apiClient } from './apiClient';

const TAX_DETAILS_ENDPOINTS = {
  GET_TAX_DETAILS: '/user/tax-details',
  UPDATE_TAX_DETAILS: '/user/tax-details',
  VERIFY_TAX_DETAILS: '/user/tax-details/verify'
};

export const taxDetailsService = {
  // Get user's tax details
  getTaxDetails: async (userId) => {
    try {
      const response = await apiClient.get(`${TAX_DETAILS_ENDPOINTS.GET_TAX_DETAILS}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tax details:', error);
      throw error;
    }
  },

  // Update tax details
  updateTaxDetails: async (userId, taxDetails) => {
    try {
      const response = await apiClient.put(`${TAX_DETAILS_ENDPOINTS.UPDATE_TAX_DETAILS}/${userId}`, taxDetails);
      return response.data;
    } catch (error) {
      console.error('Error updating tax details:', error);
      throw error;
    }
  },

  // Verify tax details
  verifyTaxDetails: async (userId, verificationData) => {
    try {
      const response = await apiClient.post(`${TAX_DETAILS_ENDPOINTS.VERIFY_TAX_DETAILS}/${userId}`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying tax details:', error);
      throw error;
    }
  }
};

export default taxDetailsService;