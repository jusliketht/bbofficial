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
      console.error('Failed to get capital gains', error);
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
      console.error('Failed to update capital gains', error);
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
      const taxRate = 0.15; // STCG is taxed at 15% for equity, or as per tax slab
      const savings = offsetAmount * taxRate;
      suggestions.push({
        type: 'offset',
        title: 'Offset Short-term Gains with Losses',
        description: `You can offset ₹${offsetAmount.toLocaleString('en-IN')} of STCG with your STCL of ₹${totalSTCL.toLocaleString('en-IN')}`,
        savings: savings,
        offsetAmount: offsetAmount,
        action: 'Apply offset',
        details: `Short-term capital gains are taxed at 15% (for equity) or as per your income tax slab. By offsetting ₹${offsetAmount.toLocaleString('en-IN')} of gains with losses, you can save ₹${savings.toLocaleString('en-IN')} in taxes.`,
      });
    }

    // Suggest offsetting LTCG with LTCL
    if (totalLTCG > 0 && totalLTCL > 0) {
      const offsetAmount = Math.min(totalLTCG, totalLTCL);
      const exemptAmount = Math.min(totalLTCG, 100000); // First ₹1L is exempt
      const taxableLTCG = Math.max(0, totalLTCG - exemptAmount);
      const offsetTaxableAmount = Math.min(offsetAmount, taxableLTCG);
      const taxRate = 0.10; // LTCG above ₹1L is taxed at 10% for equity
      const savings = offsetTaxableAmount * taxRate;
      suggestions.push({
        type: 'offset',
        title: 'Offset Long-term Gains with Losses',
        description: `You can offset ₹${offsetAmount.toLocaleString('en-IN')} of LTCG with your LTCL of ₹${totalLTCL.toLocaleString('en-IN')}`,
        savings: savings,
        offsetAmount: offsetAmount,
        action: 'Apply offset',
        details: `Long-term capital gains above ₹1,00,000 are taxed at 10% (for equity) or 20% (for other assets). By offsetting ₹${offsetAmount.toLocaleString('en-IN')} of gains with losses, you can save ₹${savings.toLocaleString('en-IN')} in taxes.`,
      });
    }

    // Suggest carrying forward losses
    if (totalSTCL > totalSTCG || totalLTCL > totalLTCG) {
      const carryForwardSTCL = Math.max(0, totalSTCL - totalSTCG);
      const carryForwardLTCL = Math.max(0, totalLTCL - totalLTCG);
      if (carryForwardSTCL > 0 || carryForwardLTCL > 0) {
        suggestions.push({
          type: 'carryforward',
          title: 'Carry Forward Losses to Next Year',
          description: `You have ₹${(carryForwardSTCL + carryForwardLTCL).toLocaleString('en-IN')} in losses that can be carried forward`,
          savings: 0,
          carryForwardSTCL: carryForwardSTCL,
          carryForwardLTCL: carryForwardLTCL,
          action: 'Review carry forward',
          details: `Short-term capital losses (₹${carryForwardSTCL.toLocaleString('en-IN')}) and long-term capital losses (₹${carryForwardLTCL.toLocaleString('en-IN')}) can be carried forward for up to 8 assessment years. These losses can be set off against future capital gains of the same type.`,
        });
      }
    }

    // Suggest tax harvesting for high gains
    if (totalSTCG > 100000 || totalLTCG > 200000) {
      const highGainAmount = Math.max(totalSTCG, totalLTCG);
      suggestions.push({
        type: 'harvest',
        title: 'Consider Tax Harvesting Strategy',
        description: `You have significant capital gains (₹${highGainAmount.toLocaleString('en-IN')}). Consider selling loss-making investments to offset gains.`,
        savings: 0,
        action: 'Learn more',
        details: 'Tax harvesting involves strategically selling loss-making investments to offset capital gains. This can help reduce your overall tax liability while maintaining your investment portfolio.',
      });
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

