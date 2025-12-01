// =====================================================
// CAPITAL GAINS SERVICE
// API service for capital gains income
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class CapitalGainsService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get capital gains income for a filing
   */
  async getCapitalGains(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/income/capital-gains`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get capital gains:', error);
      // Return empty structure if API doesn't exist
      return {
        success: true,
        hasCapitalGains: false,
        stcgDetails: [],
        ltcgDetails: [],
        totalSTCG: 0,
        totalLTCG: 0,
      };
    }
  }

  /**
   * Update capital gains income
   */
  async updateCapitalGains(filingId, capitalGainsData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/income/capital-gains`,
        capitalGainsData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update capital gains:', error);
      throw new Error(error.response?.data?.message || 'Failed to update capital gains');
    }
  }

  /**
   * Calculate capital gains
   * @param {object} entryData - {assetType, saleValue, purchaseValue/indexedCost, expenses, purchaseDate, saleDate, isLongTerm}
   * @returns {object} - Gain amount and breakdown
   */
  calculateCapitalGains(entryData) {
    const {
      assetType,
      saleValue = 0,
      purchaseValue = 0,
      indexedCost = 0,
      expenses = 0,
      purchaseDate,
      saleDate,
      isLongTerm = false,
    } = entryData;

    let gainAmount = 0;
    let costOfAcquisition = 0;

    if (isLongTerm) {
      // For LTCG, use indexed cost if provided, otherwise calculate from purchase value
      costOfAcquisition = indexedCost || this.calculateIndexedCost(purchaseValue, purchaseDate, saleDate);
      gainAmount = Math.max(0, saleValue - costOfAcquisition - expenses);
    } else {
      // For STCG, use purchase value
      costOfAcquisition = purchaseValue;
      gainAmount = Math.max(0, saleValue - purchaseValue - expenses);
    }

    return {
      success: true,
      gainAmount,
      costOfAcquisition,
      saleValue,
      expenses,
      isLongTerm,
      breakdown: {
        assetType,
        purchaseValue,
        indexedCost: isLongTerm ? costOfAcquisition : null,
        purchaseDate,
        saleDate,
      },
    };
  }

  /**
   * Calculate indexed cost of acquisition for LTCG
   * @param {number} purchaseValue - Original purchase value
   * @param {string} purchaseDate - Purchase date
   * @param {string} saleDate - Sale date
   * @returns {number} - Indexed cost
   */
  calculateIndexedCost(purchaseValue, purchaseDate, saleDate) {
    if (!purchaseDate || !saleDate) return purchaseValue;

    // Cost Inflation Index (CII) values (simplified - should use actual CII from ITD)
    const cii = {
      2018: 280,
      2019: 289,
      2020: 301,
      2021: 317,
      2022: 331,
      2023: 348,
      2024: 363,
    };

    const purchaseYear = new Date(purchaseDate).getFullYear();
    const saleYear = new Date(saleDate).getFullYear();

    const purchaseCII = cii[purchaseYear] || cii[2024];
    const saleCII = cii[saleYear] || cii[2024];

    if (purchaseCII && saleCII) {
      return (purchaseValue * saleCII) / purchaseCII;
    }

    return purchaseValue;
  }

  /**
   * Suggest tax harvesting strategies
   * @param {array} stcgEntries - Short-term capital gains entries
   * @param {array} ltcgEntries - Long-term capital gains entries
   * @param {array} lossEntries - Loss entries (if any)
   * @returns {object} - Tax harvesting suggestions
   */
  suggestTaxHarvesting(stcgEntries = [], ltcgEntries = [], lossEntries = []) {
    const suggestions = [];

    // Calculate total gains
    const totalSTCG = stcgEntries.reduce((sum, entry) => sum + (entry.gainAmount || 0), 0);
    const totalLTCG = ltcgEntries.reduce((sum, entry) => sum + (entry.gainAmount || 0), 0);
    const totalSTCL = lossEntries
      .filter((entry) => !entry.isLongTerm)
      .reduce((sum, entry) => sum + Math.abs(entry.lossAmount || 0), 0);
    const totalLTCL = lossEntries
      .filter((entry) => entry.isLongTerm)
      .reduce((sum, entry) => sum + Math.abs(entry.lossAmount || 0), 0);

    // Suggest offsetting STCG with STCL
    if (totalSTCG > 0 && totalSTCL > 0) {
      const offsetAmount = Math.min(totalSTCG, totalSTCL);
      suggestions.push({
        type: 'offset',
        title: 'Offset Short-term Gains with Losses',
        description: `You can offset ₹${offsetAmount.toLocaleString('en-IN')} of STCG with your STCL`,
        savings: offsetAmount * 0.3, // Assuming 30% tax rate on STCG
        action: 'Apply offset',
      });
    }

    // Suggest offsetting LTCG with LTCL
    if (totalLTCG > 0 && totalLTCL > 0) {
      const offsetAmount = Math.min(totalLTCG, totalLTCL);
      suggestions.push({
        type: 'offset',
        title: 'Offset Long-term Gains with Losses',
        description: `You can offset ₹${offsetAmount.toLocaleString('en-IN')} of LTCG with your LTCL`,
        savings: offsetAmount * 0.2, // Assuming 20% tax rate on LTCG
        action: 'Apply offset',
      });
    }

    // Suggest carrying forward losses
    if (totalSTCL > totalSTCG || totalLTCL > totalLTCG) {
      const carryForwardSTCL = Math.max(0, totalSTCL - totalSTCG);
      const carryForwardLTCL = Math.max(0, totalLTCL - totalLTCG);
      if (carryForwardSTCL > 0 || carryForwardLTCL > 0) {
        suggestions.push({
          type: 'carryforward',
          title: 'Carry Forward Losses',
          description: `You can carry forward ₹${(carryForwardSTCL + carryForwardLTCL).toLocaleString('en-IN')} in losses to next year`,
          savings: 0,
          action: 'Review carry forward',
        });
      }
    }

    return {
      success: true,
      suggestions,
      summary: {
        totalSTCG,
        totalLTCG,
        totalSTCL,
        totalLTCL,
        netSTCG: Math.max(0, totalSTCG - totalSTCL),
        netLTCG: Math.max(0, totalLTCG - totalLTCL),
      },
    };
  }
}

export const capitalGainsService = new CapitalGainsService();

