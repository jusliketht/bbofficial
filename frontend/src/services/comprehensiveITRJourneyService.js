// Comprehensive ITR Journey Service
// Handles comprehensive ITR journey operations

import { apiClient } from './apiClient';

class ComprehensiveITRJourneyService {
  constructor() {
    this.baseUrl = '/api/comprehensive-itr-journey';
  }

  // Get comprehensive journey data
  async getJourneyData(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/journey/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive ITR journey data:', error);
      throw error;
    }
  }

  // Update journey progress
  async updateJourneyProgress(userId, progressData) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/progress`, {
        userId,
        progressData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating journey progress:', error);
      throw error;
    }
  }

  // Get journey milestones
  async getJourneyMilestones(userId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/milestones/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching journey milestones:', error);
      throw error;
    }
  }

  // Complete journey step
  async completeJourneyStep(userId, stepId, stepData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/complete-step`, {
        userId,
        stepId,
        stepData
      });
      return response.data;
    } catch (error) {
      console.error('Error completing journey step:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const comprehensiveITRJourneyService = new ComprehensiveITRJourneyService();
export default comprehensiveITRJourneyService;