// =====================================================
// INVESTMENT PLANNING SERVICE
// Frontend API service for investment planning
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class InvestmentPlanningService {
  constructor() {
    this.basePath = '/api/tools';
  }

  /**
   * Get investment recommendations
   */
  async getRecommendations(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.availableAmount) {
        params.append('availableAmount', options.availableAmount);
      }
      if (options.riskProfile) {
        params.append('riskProfile', options.riskProfile);
      }
      if (options.currentDeductions) {
        params.append('currentDeductions', JSON.stringify(options.currentDeductions));
      }

      const response = await apiClient.get(
        `${this.basePath}/investment-planning/recommendations?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get investment recommendations:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get investment recommendations');
    }
  }

  /**
   * Calculate NPS benefits
   */
  async calculateNPSBenefits(contribution, years = 30, expectedReturns = 9) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/investment-planning/nps-calculator`,
        { contribution, years, expectedReturns },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to calculate NPS benefits:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to calculate NPS benefits');
    }
  }
}

export const investmentPlanningService = new InvestmentPlanningService();

