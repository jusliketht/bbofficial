// =====================================================
// HOUSE PROPERTY SERVICE
// API service for house property income
// =====================================================

import apiClient from '../../../../services/core/APIClient';

class HousePropertyService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Get house property income for a filing
   */
  async getHouseProperty(filingId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/income/house-property`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to get house property:', error);
      // Return empty structure if API doesn't exist
      return {
        success: true,
        properties: [],
        totalIncome: 0,
        totalLoss: 0,
      };
    }
  }

  /**
   * Update house property income
   */
  async updateHouseProperty(filingId, housePropertyData) {
    try {
      const response = await apiClient.put(
        `${this.basePath}/filings/${filingId}/income/house-property`,
        housePropertyData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to update house property:', error);
      throw new Error(error.response?.data?.message || 'Failed to update house property');
    }
  }

  /**
   * Add property
   */
  async addProperty(filingId, propertyData) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/income/house-property/properties`,
        propertyData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Failed to add property:', error);
      throw new Error(error.response?.data?.message || 'Failed to add property');
    }
  }

  /**
   * Calculate pre-construction interest deduction
   * @param {object} preConstructionData - {loanAmount, interestRate, constructionStartDate, constructionEndDate, possessionDate}
   * @returns {object} - Deduction amount and breakdown
   */
  calculatePreConstructionInterest(preConstructionData) {
    const {
      loanAmount = 0,
      interestRate = 0,
      constructionStartDate,
      constructionEndDate,
      possessionDate,
    } = preConstructionData;

    if (!constructionStartDate || !possessionDate) {
      return {
        success: false,
        error: 'Construction start date and possession date are required',
      };
    }

    const startDate = new Date(constructionStartDate);
    const endDate = constructionEndDate ? new Date(constructionEndDate) : new Date(possessionDate);
    const possession = new Date(possessionDate);

    // Calculate months between construction start and possession
    const monthsDiff = Math.max(0, Math.floor((possession - startDate) / (1000 * 60 * 60 * 24 * 30)));

    // Pre-construction interest is calculated for the period before possession
    // Maximum deduction: ₹2,00,000 per year (5 equal installments starting from possession year)
    const annualInterest = (loanAmount * interestRate) / 100;
    const preConstructionMonths = Math.min(monthsDiff, 60); // Max 5 years
    const totalPreConstructionInterest = (annualInterest * preConstructionMonths) / 12;

    // Deduction is spread over 5 years in equal installments
    const annualDeduction = Math.min(totalPreConstructionInterest / 5, 200000);

    return {
      success: true,
      totalPreConstructionInterest,
      annualDeduction,
      yearsRemaining: 5,
      breakdown: {
        loanAmount,
        interestRate,
        preConstructionMonths,
        annualInterest,
        constructionStartDate: startDate.toISOString(),
        possessionDate: possession.toISOString(),
      },
    };
  }

  /**
   * Calculate house property income/loss
   * @param {object} propertyData - Property details
   * @returns {object} - Income/loss calculation
   */
  calculatePropertyIncome(propertyData) {
    const {
      propertyType,
      annualRentalIncome = 0,
      municipalTaxes = 0,
      interestOnLoan = 0,
      preConstructionInterest = 0,
      standardDeduction = 0,
    } = propertyData;

    let grossAnnualValue = 0;
    let netAnnualValue = 0;
    let incomeOrLoss = 0;
    let calculatedStandardDeduction = standardDeduction || 0;

    if (propertyType === 'self_occupied') {
      // Self-occupied: GAV is 0, but interest deduction is allowed
      grossAnnualValue = 0;
      netAnnualValue = 0;
      // Interest deduction (max ₹2,00,000 for self-occupied)
      const interestDeduction = Math.min(interestOnLoan + preConstructionInterest, 200000);
      incomeOrLoss = -interestDeduction; // Loss
    } else if (propertyType === 'let_out' || propertyType === 'deemed_let_out') {
      // Let out: GAV = Annual rental value
      grossAnnualValue = annualRentalIncome;
      // Less: Municipal taxes
      netAnnualValue = grossAnnualValue - municipalTaxes;
      // Less: Standard deduction (30% of NAV)
      calculatedStandardDeduction = netAnnualValue * 0.3;
      // Less: Interest on loan
      const totalInterest = interestOnLoan + preConstructionInterest;
      incomeOrLoss = netAnnualValue - calculatedStandardDeduction - totalInterest;
    }

    return {
      success: true,
      grossAnnualValue,
      netAnnualValue,
      standardDeduction: calculatedStandardDeduction,
      totalInterest: interestOnLoan + preConstructionInterest,
      incomeOrLoss,
      isLoss: incomeOrLoss < 0,
    };
  }
}

export const housePropertyService = new HousePropertyService();

