import { apiClient } from './apiClient';

const PERSONAL_INFO_ENDPOINTS = {
  GET_PERSONAL_INFO: '/user/personal-info',
  UPDATE_PERSONAL_INFO: '/user/personal-info',
  VERIFY_PERSONAL_INFO: '/user/personal-info/verify'
};

export const personalInfoService = {
  // Get user's personal information
  getPersonalInfo: async (userId) => {
    try {
      const response = await apiClient.get(`${PERSONAL_INFO_ENDPOINTS.GET_PERSONAL_INFO}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching personal info:', error);
      throw error;
    }
  },

  // Update personal information
  updatePersonalInfo: async (userId, personalInfo) => {
    try {
      const response = await apiClient.put(`${PERSONAL_INFO_ENDPOINTS.UPDATE_PERSONAL_INFO}/${userId}`, personalInfo);
      return response.data;
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  },

  // Verify personal information
  verifyPersonalInfo: async (userId, verificationData) => {
    try {
      const response = await apiClient.post(`${PERSONAL_INFO_ENDPOINTS.VERIFY_PERSONAL_INFO}/${userId}`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying personal info:', error);
      throw error;
    }
  }
};

export default personalInfoService;