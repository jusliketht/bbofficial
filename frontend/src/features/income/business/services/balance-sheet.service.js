// =====================================================
// BALANCE SHEET SERVICE
// API service for balance sheet
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class BalanceSheetService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get balance sheet for a filing
   */
  async getBalanceSheet(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/balance-sheet`,
      );
      return {
        success: true,
        balanceSheet: response.data.balanceSheet || {
          hasBalanceSheet: false,
          assets: {
            currentAssets: { cash: 0, bank: 0, inventory: 0, receivables: 0, other: 0, total: 0 },
            fixedAssets: { building: 0, machinery: 0, vehicles: 0, furniture: 0, other: 0, total: 0 },
            investments: 0,
            loansAdvances: 0,
            total: 0,
          },
          liabilities: {
            currentLiabilities: { creditors: 0, bankOverdraft: 0, shortTermLoans: 0, other: 0, total: 0 },
            longTermLiabilities: { longTermLoans: 0, other: 0, total: 0 },
            capital: 0,
            total: 0,
          },
        },
      };
    } catch (error) {
      console.error('Failed to get balance sheet:', error);
      throw new Error(error.response?.data?.error || 'Failed to get balance sheet');
    }
  }

  /**
   * Update balance sheet
   */
  async updateBalanceSheet(filingId, balanceSheetData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/balance-sheet`,
        balanceSheetData,
      );
      return {
        success: true,
        balanceSheet: response.data.balanceSheet,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update balance sheet:', error);
      throw new Error(error.response?.data?.error || 'Failed to update balance sheet');
    }
  }
}

export const balanceSheetService = new BalanceSheetService();

