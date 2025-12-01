// =====================================================
// PROFESSIONAL INCOME SERVICE
// API service for professional income
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class ProfessionalIncomeService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get professional income for a filing
   */
  async getProfessionalIncome(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/income/professional`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get professional income:', error);
      // Return empty structure if API doesn't exist
      return {
        success: true,
        activities: [],
        totalIncome: 0,
      };
    }
  }

  /**
   * Update professional income
   */
  async updateProfessionalIncome(filingId, professionalIncomeData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/income/professional`,
        professionalIncomeData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update professional income:', error);
      throw new Error(error.response?.data?.message || 'Failed to update professional income');
    }
  }

  /**
   * Calculate net professional income
   * @param {object} activityData - Professional activity data
   * @returns {object} - Net income calculation
   */
  calculateNetIncome(activityData) {
    const {
      grossReceipts = 0,
      expenses = {},
      depreciation = 0,
      otherExpenses = 0,
    } = activityData;

    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) + depreciation + otherExpenses;
    const netIncome = grossReceipts - totalExpenses;

    return {
      success: true,
      grossReceipts,
      totalExpenses,
      netIncome,
      breakdown: {
        expenses,
        depreciation,
        otherExpenses,
      },
    };
  }
}

export const professionalIncomeService = new ProfessionalIncomeService();

