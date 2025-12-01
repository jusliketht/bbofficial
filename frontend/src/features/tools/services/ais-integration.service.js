// =====================================================
// AIS INTEGRATION SERVICE
// Service to integrate AIS data with ITR filing
// =====================================================

import { AISForm26ASService } from '../../../services/AISForm26ASService';
import apiClient from '../../../services/core/APIClient';

class AISIntegrationService {
  constructor() {
    this.aisService = new AISForm26ASService();
    this.basePath = '/api/itr';
  }

  /**
   * Fetch and integrate AIS data for a filing
   * @param {string} filingId - Filing ID
   * @param {string} authToken - Income Tax Portal auth token
   * @param {string} assessmentYear - Assessment year
   * @returns {object} - Integrated AIS data
   */
  async integrateAISData(filingId, authToken, assessmentYear = '2024-25') {
    try {
      // Fetch AIS data
      const aisResult = await this.aisService.fetchAISData(filingId, authToken, assessmentYear);

      if (!aisResult.success) {
        return {
          success: false,
          error: aisResult.error || 'Failed to fetch AIS data',
        };
      }

      const aisData = aisResult.data;

      // Map AIS data to ITR structure
      const mappedData = this.mapAISToITR(aisData);

      // Apply to filing
      const applyResult = await this.applyAISDataToFiling(filingId, mappedData);

      return {
        success: true,
        data: mappedData,
        applied: applyResult.success,
        summary: aisResult.summary,
      };
    } catch (error) {
      console.error('AIS integration error:', error);
      return {
        success: false,
        error: error.message || 'Failed to integrate AIS data',
      };
    }
  }

  /**
   * Map AIS data to ITR structure
   * @param {object} aisData - Raw AIS data
   * @returns {object} - Mapped ITR data
   */
  mapAISToITR(aisData) {
    const mapped = {
      income: {},
      taxesPaid: {
        tds: [],
        advanceTax: [],
        selfAssessmentTax: [],
      },
    };

    // Map income from AIS
    if (aisData.incomeDetails) {
      aisData.incomeDetails.forEach((income) => {
        const category = this.categorizeIncome(income);
        if (!mapped.income[category]) {
          mapped.income[category] = [];
        }
        mapped.income[category].push({
          source: income.source,
          amount: income.amount,
          date: income.date,
          description: income.description,
          sourceDocument: 'AIS',
        });
      });
    }

    // Map TDS from AIS
    if (aisData.tdsDetails) {
      mapped.taxesPaid.tds = aisData.tdsDetails.map((tds) => ({
        deductorName: tds.deductorName,
        tan: tds.tan,
        section: tds.section,
        amount: tds.amount,
        tdsAmount: tds.tdsAmount,
        date: tds.date,
        sourceDocument: 'AIS',
      }));
    }

    return mapped;
  }

  /**
   * Categorize income from AIS
   * @param {object} income - Income entry from AIS
   * @returns {string} - Income category
   */
  categorizeIncome(income) {
    const source = (income.source || '').toLowerCase();
    const description = (income.description || '').toLowerCase();

    if (source.includes('salary') || description.includes('salary')) {
      return 'salary';
    }
    if (source.includes('interest') || description.includes('interest')) {
      return 'interest';
    }
    if (source.includes('dividend') || description.includes('dividend')) {
      return 'dividend';
    }
    if (source.includes('capital') || description.includes('capital')) {
      return 'capitalGains';
    }
    if (source.includes('rent') || description.includes('rent')) {
      return 'houseProperty';
    }
    return 'other';
  }

  /**
   * Apply AIS data to filing
   * @param {string} filingId - Filing ID
   * @param {object} mappedData - Mapped ITR data
   * @returns {object} - Application result
   */
  async applyAISDataToFiling(filingId, mappedData) {
    try {
      // Update income sections
      for (const [category, entries] of Object.entries(mappedData.income)) {
        if (category === 'salary' && entries.length > 0) {
          // Update salary income
          await apiClient.put(`${this.basePath}/filings/${filingId}/income/salary`, {
            employers: entries.map((entry) => ({
              employerName: entry.source,
              totalSalary: entry.amount,
              source: 'AIS',
            })),
          });
        } else if (category === 'interest' && entries.length > 0) {
          // Update other sources income (interest)
          // This would need to be handled by the other sources service
        }
      }

      // Update taxes paid
      if (mappedData.taxesPaid.tds.length > 0) {
        await apiClient.put(`${this.basePath}/filings/${filingId}/taxes-paid`, {
          tds: mappedData.taxesPaid.tds,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to apply AIS data:', error);
      return {
        success: false,
        error: error.message || 'Failed to apply AIS data',
      };
    }
  }

  /**
   * Compare AIS data with entered data
   * @param {object} aisData - AIS data
   * @param {object} enteredData - User entered data
   * @returns {object} - Comparison result with discrepancies
   */
  compareWithEnteredData(aisData, enteredData) {
    const discrepancies = [];

    // Compare income
    if (aisData.incomeDetails) {
      aisData.incomeDetails.forEach((aisIncome) => {
        const category = this.categorizeIncome(aisIncome);
        const enteredIncome = enteredData.income?.[category];

        if (enteredIncome) {
          const totalEntered = Array.isArray(enteredIncome)
            ? enteredIncome.reduce((sum, item) => sum + (item.amount || item.totalSalary || 0), 0)
            : enteredIncome;

          const diff = Math.abs(aisIncome.amount - totalEntered);
          if (diff > 100) {
            discrepancies.push({
              field: category,
              aisValue: aisIncome.amount,
              enteredValue: totalEntered,
              difference: diff,
              severity: diff > 10000 ? 'error' : 'warning',
              source: 'AIS',
            });
          }
        }
      });
    }

    // Compare TDS
    if (aisData.tdsDetails) {
      const totalAISTDS = aisData.tdsDetails.reduce((sum, tds) => sum + (tds.tdsAmount || 0), 0);
      const totalEnteredTDS = enteredData.taxesPaid?.tds?.reduce(
        (sum, tds) => sum + (tds.tdsAmount || tds.amount || 0),
        0,
      ) || 0;

      const diff = Math.abs(totalAISTDS - totalEnteredTDS);
      if (diff > 100) {
        discrepancies.push({
          field: 'tds',
          aisValue: totalAISTDS,
          enteredValue: totalEnteredTDS,
          difference: diff,
          severity: diff > 10000 ? 'error' : 'warning',
          source: 'AIS',
        });
      }
    }

    return {
      hasDiscrepancies: discrepancies.length > 0,
      discrepancies,
      matchPercentage:
        discrepancies.length === 0 ? 100 : Math.max(0, 100 - discrepancies.length * 10),
    };
  }
}

export const aisIntegrationService = new AISIntegrationService();

