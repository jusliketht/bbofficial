// =====================================================
// AIS INTEGRATION SERVICE FOR BUSINESS INCOME
// Fetches and maps AIS business income data (Section 194C - TDS on Payment to Contractor)
// =====================================================

import apiClient from '../../../../services/core/APIClient';
import { AISForm26ASService } from '../../../../services/AISForm26ASService';

class BusinessIncomeAISService {
  constructor() {
    this.basePath = '/api/itr';
    this.aisService = new AISForm26ASService();
  }

  /**
   * Fetch AIS business income data for a filing
   * @param {string} filingId - Filing ID
   * @param {string} assessmentYear - Assessment year
   * @returns {object} AIS business income data
   */
  async fetchAISBusinessIncome(filingId, assessmentYear = '2024-25') {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/ais/business-income`,
        { params: { assessmentYear } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AIS business income:', error);
      // If endpoint doesn't exist, try to fetch from general AIS data
      return this.fetchFromGeneralAIS(filingId, assessmentYear);
    }
  }

  /**
   * Fetch business income from general AIS data
   */
  async fetchFromGeneralAIS(filingId, assessmentYear) {
    try {
      // This would typically require authentication token
      // For now, return structure that can be populated
      return {
        success: true,
        businessIncome: [],
        summary: {
          totalGrossReceipts: 0,
          totalTDS: 0,
          businesses: [],
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch from general AIS:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch AIS business income');
    }
  }

  /**
   * Map AIS data to business income structure
   * @param {object} aisData - Raw AIS data
   * @returns {array} Mapped business array
   */
  mapAISToBusinessIncome(aisData) {
    const businesses = [];

    if (!aisData || !aisData.businessIncome || !Array.isArray(aisData.businessIncome)) {
      return businesses;
    }

    // Group by business/payer to create business entries
    const businessMap = new Map();

    aisData.businessIncome.forEach((entry, index) => {
      const payerName = entry.payerName || entry.clientName || `Business ${index + 1}`;
      const businessKey = entry.gstNumber || payerName;

      if (!businessMap.has(businessKey)) {
        businessMap.set(businessKey, {
          id: `ais-business-${index}`,
          businessName: payerName,
          businessNature: entry.businessNature || 'trading',
          businessAddress: entry.address || '',
          businessPAN: entry.payerPAN || '',
          gstNumber: entry.gstNumber || '',
          source: 'ais',
          sourceData: {
            section: '194C',
            tdsCertificate: entry.certificateNumber,
            date: entry.date || new Date().toISOString(),
            confidence: 0.95,
          },
          pnl: {
            grossReceipts: 0,
            openingStock: 0,
            purchases: 0,
            closingStock: 0,
            directExpenses: {
              rawMaterials: 0,
              wages: 0,
              powerFuel: 0,
              freight: 0,
              other: 0,
              total: 0,
            },
            indirectExpenses: {
              rent: 0,
              salary: 0,
              utilities: 0,
              insurance: 0,
              advertising: 0,
              professionalFees: 0,
              other: 0,
              total: 0,
            },
            depreciation: {
              building: 0,
              machinery: 0,
              vehicles: 0,
              furniture: 0,
              other: 0,
              total: 0,
            },
            otherExpenses: 0,
            netProfit: 0,
            tdsDeducted: 0,
          },
          entries: [],
        });
      }

      const business = businessMap.get(businessKey);
      const grossAmount = entry.grossAmount || entry.amount || 0;
      const tdsAmount = entry.tdsAmount || entry.tds || 0;

      business.pnl.grossReceipts += grossAmount;
      business.pnl.tdsDeducted += tdsAmount;
      business.entries.push({
        date: entry.date,
        amount: grossAmount,
        tds: tdsAmount,
        certificateNumber: entry.certificateNumber,
        section: entry.section || '194C',
      });
    });

    return Array.from(businessMap.values());
  }

  /**
   * Apply AIS data to business income form
   * @param {string} filingId - Filing ID
   * @param {array} businesses - Business entries to apply
   * @returns {object} Updated business income data
   */
  async applyAISData(filingId, businesses) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/income/business/apply-ais`,
        { businesses },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to apply AIS business income data:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to apply AIS business income data');
    }
  }

  /**
   * Compare AIS data with existing form data
   * @param {object} aisData - AIS data
   * @param {array} formBusinesses - Existing form businesses
   * @returns {object} Comparison result
   */
  compareAISWithForm(aisData, formBusinesses = []) {
    const mappedAIS = this.mapAISToBusinessIncome(aisData);
    const comparison = {
      newEntries: [],
      duplicates: [],
      conflicts: [],
      summary: {
        aisCount: mappedAIS.length,
        formCount: formBusinesses.length,
        newCount: 0,
        duplicateCount: 0,
        conflictCount: 0,
      },
    };

    mappedAIS.forEach((aisBusiness) => {
      const existing = formBusinesses.find(
        (fb) => fb.businessPAN === aisBusiness.businessPAN ||
                fb.gstNumber === aisBusiness.gstNumber ||
                fb.businessName === aisBusiness.businessName,
      );

      if (!existing) {
        comparison.newEntries.push(aisBusiness);
        comparison.summary.newCount++;
      } else {
        // Check for conflicts (different amounts)
        const aisTotal = aisBusiness.pnl.grossReceipts;
        const formTotal = existing.pnl?.grossReceipts || 0;
        const difference = Math.abs(aisTotal - formTotal);

        if (difference > 100) { // Threshold for conflict
          comparison.conflicts.push({
            ais: aisBusiness,
            form: existing,
            difference,
          });
          comparison.summary.conflictCount++;
        } else {
          comparison.duplicates.push({
            ais: aisBusiness,
            form: existing,
          });
          comparison.summary.duplicateCount++;
        }
      }
    });

    return comparison;
  }
}

export const businessIncomeAISService = new BusinessIncomeAISService();
export default businessIncomeAISService;

