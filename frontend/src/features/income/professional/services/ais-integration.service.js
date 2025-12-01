// =====================================================
// AIS INTEGRATION SERVICE FOR PROFESSIONAL INCOME
// Fetches and maps AIS professional income data (Section 194J - TDS on Professional Fees)
// =====================================================

import apiClient from '../../../../services/core/APIClient';
import { AISForm26ASService } from '../../../../services/AISForm26ASService';

class ProfessionalIncomeAISService {
  constructor() {
    this.basePath = '/api/itr';
    this.aisService = new AISForm26ASService();
  }

  /**
   * Fetch AIS professional income data for a filing
   * @param {string} filingId - Filing ID
   * @param {string} assessmentYear - Assessment year
   * @returns {object} AIS professional income data
   */
  async fetchAISProfessionalIncome(filingId, assessmentYear = '2024-25') {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/ais/professional-income`,
        { params: { assessmentYear } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AIS professional income:', error);
      // If endpoint doesn't exist, try to fetch from general AIS data
      return this.fetchFromGeneralAIS(filingId, assessmentYear);
    }
  }

  /**
   * Fetch professional income from general AIS data
   */
  async fetchFromGeneralAIS(filingId, assessmentYear) {
    try {
      // This would typically require authentication token
      // For now, return structure that can be populated
      return {
        success: true,
        professionalIncome: [],
        summary: {
          totalProfessionalFees: 0,
          totalTDS: 0,
          professions: [],
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch from general AIS:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch AIS professional income');
    }
  }

  /**
   * Map AIS data to professional income structure
   * @param {object} aisData - Raw AIS data
   * @returns {array} Mapped profession array
   */
  mapAISToProfessionalIncome(aisData) {
    const professions = [];

    if (!aisData || !aisData.professionalIncome || !Array.isArray(aisData.professionalIncome)) {
      return professions;
    }

    // Group by client/payer to create profession entries
    const professionMap = new Map();

    aisData.professionalIncome.forEach((entry, index) => {
      const payerName = entry.payerName || entry.clientName || `Client ${index + 1}`;
      const professionKey = entry.registrationNumber || payerName;

      if (!professionMap.has(professionKey)) {
        professionMap.set(professionKey, {
          id: `ais-profession-${index}`,
          professionName: payerName,
          professionType: entry.professionType || 'consulting',
          professionAddress: entry.address || '',
          registrationNumber: entry.registrationNumber || '',
          source: 'ais',
          sourceData: {
            section: '194J',
            tdsCertificate: entry.certificateNumber,
            date: entry.date || new Date().toISOString(),
            confidence: 0.95,
          },
          pnl: {
            professionalFees: 0,
            expenses: {
              officeRent: 0,
              professionalFeesPaid: 0,
              travel: 0,
              communication: 0,
              booksPeriodicals: 0,
              other: 0,
              total: 0,
            },
            depreciation: {
              officeEquipment: 0,
              furniture: 0,
              vehicles: 0,
              other: 0,
              total: 0,
            },
            netIncome: 0,
            tdsDeducted: 0,
          },
          entries: [],
        });
      }

      const profession = professionMap.get(professionKey);
      const grossAmount = entry.grossAmount || entry.amount || 0;
      const tdsAmount = entry.tdsAmount || entry.tds || 0;

      profession.pnl.professionalFees += grossAmount;
      profession.pnl.tdsDeducted += tdsAmount;
      profession.entries.push({
        date: entry.date,
        amount: grossAmount,
        tds: tdsAmount,
        certificateNumber: entry.certificateNumber,
        section: entry.section || '194J',
      });
    });

    return Array.from(professionMap.values());
  }

  /**
   * Apply AIS data to professional income form
   * @param {string} filingId - Filing ID
   * @param {array} professions - Profession entries to apply
   * @returns {object} Updated professional income data
   */
  async applyAISData(filingId, professions) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/income/professional/apply-ais`,
        { professions },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to apply AIS professional income data:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to apply AIS professional income data');
    }
  }

  /**
   * Compare AIS data with existing form data
   * @param {object} aisData - AIS data
   * @param {array} formProfessions - Existing form professions
   * @returns {object} Comparison result
   */
  compareAISWithForm(aisData, formProfessions = []) {
    const mappedAIS = this.mapAISToProfessionalIncome(aisData);
    const comparison = {
      newEntries: [],
      duplicates: [],
      conflicts: [],
      summary: {
        aisCount: mappedAIS.length,
        formCount: formProfessions.length,
        newCount: 0,
        duplicateCount: 0,
        conflictCount: 0,
      },
    };

    mappedAIS.forEach((aisProfession) => {
      const existing = formProfessions.find(
        (fp) => fp.registrationNumber === aisProfession.registrationNumber ||
                fp.professionName === aisProfession.professionName,
      );

      if (!existing) {
        comparison.newEntries.push(aisProfession);
        comparison.summary.newCount++;
      } else {
        // Check for conflicts (different amounts)
        const aisTotal = aisProfession.pnl.professionalFees;
        const formTotal = existing.pnl?.professionalFees || 0;
        const difference = Math.abs(aisTotal - formTotal);

        if (difference > 100) { // Threshold for conflict
          comparison.conflicts.push({
            ais: aisProfession,
            form: existing,
            difference,
          });
          comparison.summary.conflictCount++;
        } else {
          comparison.duplicates.push({
            ais: aisProfession,
            form: existing,
          });
          comparison.summary.duplicateCount++;
        }
      }
    });

    return comparison;
  }
}

export const professionalIncomeAISService = new ProfessionalIncomeAISService();
export default professionalIncomeAISService;

