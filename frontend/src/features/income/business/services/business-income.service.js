// =====================================================
// BUSINESS INCOME SERVICE
// API service for business income
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class BusinessIncomeService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get business income for a filing
   */
  async getBusinessIncome(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/income/business`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get business income:', error);
      // Return empty structure if API doesn't exist
      return {
        success: true,
        businesses: [],
        totalIncome: 0,
      };
    }
  }

  /**
   * Update business income
   */
  async updateBusinessIncome(filingId, businessIncomeData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/income/business`,
        businessIncomeData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update business income:', error);
      throw new Error(error.response?.data?.message || 'Failed to update business income');
    }
  }

  /**
   * Calculate presumptive tax (Section 44AD/44ADA/44AE)
   * @param {object} businessData - {grossReceipts, businessType, section}
   * @returns {object} - Presumptive income and tax calculation
   */
  calculatePresumptiveTax(businessData) {
    const { grossReceipts = 0, businessType, section = '44AD' } = businessData;

    let presumptiveIncome = 0;
    let applicableSection = section;

    if (section === '44AD') {
      // Section 44AD: 8% of gross receipts (6% for digital receipts)
      presumptiveIncome = grossReceipts * 0.08;
      // For digital receipts, it's 6%
      if (businessData.isDigitalReceipts) {
        presumptiveIncome = grossReceipts * 0.06;
      }
    } else if (section === '44ADA') {
      // Section 44ADA: 50% of gross receipts for professionals
      presumptiveIncome = grossReceipts * 0.5;
    } else if (section === '44AE') {
      // Section 44AE: For goods carriage business
      const vehicles = businessData.numberOfVehicles || 1;
      const heavyVehicles = businessData.heavyVehicles || 0;
      const lightVehicles = vehicles - heavyVehicles;
      // Heavy vehicle: ₹7,500 per month, Light vehicle: ₹7,500 per month
      presumptiveIncome = (heavyVehicles * 7500 * 12) + (lightVehicles * 7500 * 12);
    }

    return {
      success: true,
      presumptiveIncome,
      grossReceipts,
      applicableSection,
      breakdown: {
        section,
        businessType,
        calculation: section === '44AD'
          ? `${businessData.isDigitalReceipts ? '6%' : '8%'} of gross receipts`
          : section === '44ADA'
          ? '50% of gross receipts'
          : 'As per Section 44AE rates',
      },
    };
  }

  /**
   * Calculate net profit from P&L
   * @param {object} pnlData - Profit & Loss statement data
   * @returns {object} - Net profit calculation
   */
  calculateNetProfit(pnlData) {
    const {
      grossReceipts = 0,
      openingStock = 0,
      purchases = 0,
      closingStock = 0,
      directExpenses = {},
      indirectExpenses = {},
      depreciation = {},
      otherExpenses = 0,
    } = pnlData;

    // Calculate cost of goods sold
    const costOfGoodsSold = openingStock + purchases - closingStock;

    // Calculate gross profit
    const grossProfit = grossReceipts - costOfGoodsSold;

    // Calculate total expenses
    const totalDirectExpenses = directExpenses.total || Object.values(directExpenses).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const totalIndirectExpenses = indirectExpenses.total || Object.values(indirectExpenses).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const totalDepreciation = depreciation.total || Object.values(depreciation).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const totalExpenses = totalDirectExpenses + totalIndirectExpenses + totalDepreciation + otherExpenses;

    // Calculate net profit
    const netProfit = grossProfit - totalExpenses;

    return {
      success: true,
      grossReceipts,
      costOfGoodsSold,
      grossProfit,
      totalExpenses,
      netProfit,
      breakdown: {
        openingStock,
        purchases,
        closingStock,
        directExpenses: totalDirectExpenses,
        indirectExpenses: totalIndirectExpenses,
        depreciation: totalDepreciation,
        otherExpenses,
      },
    };
  }
}

export const businessIncomeService = new BusinessIncomeService();

