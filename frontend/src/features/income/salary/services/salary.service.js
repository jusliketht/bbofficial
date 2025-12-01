// =====================================================
// SALARY SERVICE
// API service for salary income
// =====================================================

import apiClient from '../../../services/core/APIClient';

class SalaryService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get salary income for a filing
   */
  async getSalary(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/income/salary`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get salary:', error);
      // Return empty structure if API doesn't exist
      return {
        success: true,
        employers: [],
        totalSalary: 0,
      };
    }
  }

  /**
   * Update salary income
   */
  async updateSalary(filingId, salaryData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/income/salary`,
        salaryData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update salary:', error);
      throw new Error(error.response?.data?.message || 'Failed to update salary');
    }
  }

  /**
   * Add employer
   */
  async addEmployer(filingId, employerData) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/income/salary/employers`,
        employerData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to add employer:', error);
      throw new Error(error.response?.data?.message || 'Failed to add employer');
    }
  }

  /**
   * Calculate HRA exemption
   * @param {object} hraData - {hraReceived, rentPaid, cityType, basicSalary}
   * @returns {object} - Exemption amount and breakdown
   */
  calculateHRAExemption(hraData) {
    const { hraReceived = 0, rentPaid = 0, cityType = 'non-metro', basicSalary = 0 } = hraData;

    // HRA exemption is minimum of:
    // 1. Actual HRA received
    // 2. Rent paid - 10% of basic salary
    // 3. 50% of basic salary (metro) or 40% (non-metro)

    const rentMinus10Percent = Math.max(0, rentPaid - basicSalary * 0.1);
    const percentageOfBasic = cityType === 'metro' ? basicSalary * 0.5 : basicSalary * 0.4;

    const exemption = Math.min(hraReceived, rentMinus10Percent, percentageOfBasic);
    const taxableHRA = hraReceived - exemption;

    return {
      success: true,
      exemption,
      taxableHRA,
      breakdown: {
        hraReceived,
        rentPaid,
        rentMinus10Percent,
        percentageOfBasic,
        cityType,
      },
    };
  }

  /**
   * Compare Form 16 data with entered data
   */
  compareWithForm16(form16Data, enteredData) {
    const discrepancies = [];

    if (form16Data.basic && enteredData.basic) {
      const diff = Math.abs(form16Data.basic - enteredData.basic);
      if (diff > 100) {
        discrepancies.push({
          field: 'basic',
          form16Value: form16Data.basic,
          enteredValue: enteredData.basic,
          difference: diff,
          severity: diff > 10000 ? 'error' : 'warning',
        });
      }
    }

    if (form16Data.hra && enteredData.hra) {
      const diff = Math.abs(form16Data.hra - enteredData.hra);
      if (diff > 100) {
        discrepancies.push({
          field: 'hra',
          form16Value: form16Data.hra,
          enteredValue: enteredData.hra,
          difference: diff,
          severity: diff > 10000 ? 'error' : 'warning',
        });
      }
    }

    if (form16Data.totalSalary && enteredData.totalSalary) {
      const diff = Math.abs(form16Data.totalSalary - enteredData.totalSalary);
      if (diff > 100) {
        discrepancies.push({
          field: 'totalSalary',
          form16Value: form16Data.totalSalary,
          enteredValue: enteredData.totalSalary,
          difference: diff,
          severity: diff > 10000 ? 'error' : 'warning',
        });
      }
    }

    return {
      hasDiscrepancies: discrepancies.length > 0,
      discrepancies,
      matchPercentage: discrepancies.length === 0 ? 100 : Math.max(0, 100 - discrepancies.length * 20),
    };
  }
}

export const salaryService = new SalaryService();

