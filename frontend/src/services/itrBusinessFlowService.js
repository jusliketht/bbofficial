// ITR Business Flow Service
// Handles business flow operations for ITR filing

import { apiClient } from './apiClient';

class ITRBusinessFlowService {
  constructor() {
    this.baseUrl = '/api/itr-business-flow';
  }

  // Get business flow statistics
  async getBusinessFlowStats(userId, period) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`, {
        params: { userId, period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching business flow stats:', error);
      throw error;
    }
  }

  // Check ITR eligibility
  async checkITREligibility(userId, businessData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/check-eligibility`, {
        userId,
        businessData
      });
      return response.data;
    } catch (error) {
      console.error('Error checking ITR eligibility:', error);
      throw error;
    }
  }

  // Get comprehensive ITR journey data
  async getComprehensiveITRJourney(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/comprehensive-journey/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive ITR journey:', error);
      throw error;
    }
  }

  // Get business flow recommendations
  async getBusinessFlowRecommendations(userId, businessType) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/recommendations`, {
        params: { userId, businessType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching business flow recommendations:', error);
      throw error;
    }
  }

  // Get business flow analytics
  async getBusinessFlowAnalytics(userId, period) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics`, {
        params: { userId, period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching business flow analytics:', error);
      throw error;
    }
  }

  // Update business flow data
  async updateBusinessFlowData(userId, flowData) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/update`, {
        userId,
        flowData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating business flow data:', error);
      throw error;
    }
  }

  // Get business flow history
  async getBusinessFlowHistory(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business flow history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const itrBusinessFlowService = new ITRBusinessFlowService();
export default itrBusinessFlowService;