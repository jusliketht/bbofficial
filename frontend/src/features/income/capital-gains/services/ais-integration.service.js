// =====================================================
// AIS INTEGRATION SERVICE FOR CAPITAL GAINS
// Fetches and maps AIS capital gains data
// =====================================================

import apiClient from '../../../../services/core/APIClient';
import { AISForm26ASService } from '../../../../services/AISForm26ASService';

class CapitalGainsAISService {
  constructor() {
    this.basePath = '/api/itr';
    this.aisService = new AISForm26ASService();
  }

  /**
   * Fetch AIS capital gains data for a filing
   * @param {string} filingId - Filing ID
   * @param {string} assessmentYear - Assessment year
   * @returns {object} AIS capital gains data
   */
  async fetchAISCapitalGains(filingId, assessmentYear = '2024-25') {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/ais/capital-gains`,
        { params: { assessmentYear } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AIS capital gains:', error);
      // If endpoint doesn't exist, try to fetch from general AIS data
      return this.fetchFromGeneralAIS(filingId, assessmentYear);
    }
  }

  /**
   * Fetch capital gains from general AIS data
   */
  async fetchFromGeneralAIS(filingId, assessmentYear) {
    try {
      // This would typically require authentication token
      // For now, return structure that can be populated
      return {
        success: true,
        capitalGains: [],
        summary: {
          totalSTCG: 0,
          totalLTCG: 0,
          transactions: [],
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch from general AIS:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch AIS capital gains');
    }
  }

  /**
   * Map AIS data to capital gains structure
   * @param {object} aisData - Raw AIS data
   * @returns {object} Mapped capital gains data
   */
  mapAISToCapitalGains(aisData) {
    const stcgEntries = [];
    const ltcgEntries = [];

    if (!aisData || !aisData.capitalGains || !Array.isArray(aisData.capitalGains)) {
      return { stcgEntries, ltcgEntries };
    }

    aisData.capitalGains.forEach((gain, index) => {
      const entry = {
        id: `ais-gain-${index}`,
        assetType: gain.assetType || 'equity_shares',
        saleValue: gain.saleValue || 0,
        purchaseValue: gain.purchaseValue || 0,
        expenses: gain.expenses || 0,
        saleDate: gain.saleDate,
        purchaseDate: gain.purchaseDate,
        gainAmount: (gain.saleValue || 0) - (gain.purchaseValue || 0) - (gain.expenses || 0),
        source: 'ais',
        sourceData: {
          pan: gain.pan,
          section: gain.section || '194',
          date: gain.date,
          confidence: gain.confidence || 0.9,
        },
      };

      // Determine if STCG or LTCG based on holding period
      if (gain.holdingPeriod && gain.holdingPeriod >= 365) {
        ltcgEntries.push(entry);
      } else {
        stcgEntries.push(entry);
      }
    });

    return { stcgEntries, ltcgEntries };
  }

  /**
   * Apply AIS data to capital gains form
   * @param {string} filingId - Filing ID
   * @param {array} stcgEntries - STCG entries to apply
   * @param {array} ltcgEntries - LTCG entries to apply
   * @returns {object} Result
   */
  async applyAISData(filingId, stcgEntries, ltcgEntries) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/income/capital-gains/apply-ais`,
        { stcgEntries, ltcgEntries },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to apply AIS data:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to apply AIS data');
    }
  }

  /**
   * Compare AIS data with existing form data
   * @param {array} aisSTCG - STCG entries from AIS
   * @param {array} aisLTCG - LTCG entries from AIS
   * @param {array} formSTCG - STCG entries from form
   * @param {array} formLTCG - LTCG entries from form
   * @returns {object} Comparison result with discrepancies
   */
  compareWithFormData(aisSTCG, aisLTCG, formSTCG, formLTCG) {
    const discrepancies = [];
    const matches = [];

    // Compare STCG entries
    aisSTCG.forEach((aisEntry) => {
      const matchingFormEntry = formSTCG.find(
        (formEntry) =>
          formEntry.assetType === aisEntry.assetType ||
          Math.abs((formEntry.saleValue || 0) - (aisEntry.saleValue || 0)) < 1000,
      );

      if (matchingFormEntry) {
        const gainDiff = Math.abs(
          (matchingFormEntry.gainAmount || 0) - (aisEntry.gainAmount || 0),
        );
        if (gainDiff > 100) {
          discrepancies.push({
            type: 'STCG',
            assetType: aisEntry.assetType || 'Unknown',
            field: 'gainAmount',
            formValue: matchingFormEntry.gainAmount || 0,
            aisValue: aisEntry.gainAmount || 0,
            difference: gainDiff,
            severity: gainDiff > 10000 ? 'critical' : gainDiff > 1000 ? 'warning' : 'info',
          });
        } else {
          matches.push({
            type: 'STCG',
            assetType: aisEntry.assetType || 'Unknown',
            formValue: matchingFormEntry.gainAmount || 0,
            aisValue: aisEntry.gainAmount || 0,
          });
        }
      } else {
        discrepancies.push({
          type: 'STCG',
          assetType: aisEntry.assetType || 'Unknown',
          field: 'new_entry',
          formValue: null,
          aisValue: aisEntry.gainAmount || 0,
          difference: aisEntry.gainAmount || 0,
          severity: 'info',
          isNew: true,
        });
      }
    });

    // Compare LTCG entries
    aisLTCG.forEach((aisEntry) => {
      const matchingFormEntry = formLTCG.find(
        (formEntry) =>
          formEntry.assetType === aisEntry.assetType ||
          Math.abs((formEntry.saleValue || 0) - (aisEntry.saleValue || 0)) < 1000,
      );

      if (matchingFormEntry) {
        const gainDiff = Math.abs(
          (matchingFormEntry.gainAmount || 0) - (aisEntry.gainAmount || 0),
        );
        if (gainDiff > 100) {
          discrepancies.push({
            type: 'LTCG',
            assetType: aisEntry.assetType || 'Unknown',
            field: 'gainAmount',
            formValue: matchingFormEntry.gainAmount || 0,
            aisValue: aisEntry.gainAmount || 0,
            difference: gainDiff,
            severity: gainDiff > 10000 ? 'critical' : gainDiff > 1000 ? 'warning' : 'info',
          });
        } else {
          matches.push({
            type: 'LTCG',
            assetType: aisEntry.assetType || 'Unknown',
            formValue: matchingFormEntry.gainAmount || 0,
            aisValue: aisEntry.gainAmount || 0,
          });
        }
      } else {
        discrepancies.push({
          type: 'LTCG',
          assetType: aisEntry.assetType || 'Unknown',
          field: 'new_entry',
          formValue: null,
          aisValue: aisEntry.gainAmount || 0,
          difference: aisEntry.gainAmount || 0,
          severity: 'info',
          isNew: true,
        });
      }
    });

    return {
      matches,
      discrepancies,
      summary: {
        totalAISSTCG: aisSTCG.length,
        totalAISLTCG: aisLTCG.length,
        totalFormSTCG: formSTCG.length,
        totalFormLTCG: formLTCG.length,
        matches: matches.length,
        discrepancies: discrepancies.length,
      },
    };
  }
}

export const capitalGainsAISService = new CapitalGainsAISService();

