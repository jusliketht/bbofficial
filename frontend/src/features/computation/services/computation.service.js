// =====================================================
// COMPUTATION SERVICE
// API service for tax computation
// =====================================================

import apiClient from '../../../services/core/APIClient';

class ComputationService {
  constructor() {
    this.basePath = '/api/itr';
  }

  /**
   * Compute tax for a filing
   */
  async computeTax(filingId, formData) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/compute-tax`,
        formData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Tax computation failed:', error);
      // Fallback to local computation
      return this.computeTaxLocal(formData);
    }
  }

  /**
   * Compare old vs new regime
   */
  async compareRegimes(filingId, formData) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/compare-regimes`,
        formData,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Regime comparison failed:', error);
      throw new Error(error.response?.data?.message || 'Regime comparison failed');
    }
  }

  /**
   * Get slab-wise tax breakdown
   */
  async getTaxBreakdown(filingId, regime = 'old') {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/tax-breakdown?regime=${regime}`,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Tax breakdown failed:', error);
      throw new Error(error.response?.data?.message || 'Tax breakdown failed');
    }
  }

  /**
   * Calculate interest (234A/234B/234C)
   */
  async calculateInterest(filingId, params) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/calculate-interest`,
        params,
      );
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      console.error('Interest calculation failed:', error);
      throw new Error(error.response?.data?.message || 'Interest calculation failed');
    }
  }

  /**
   * Local tax computation fallback
   */
  computeTaxLocal(formData) {
    const income = formData.income || {};
    const deductions = formData.deductions || {};
    const taxesPaid = formData.taxesPaid || {};

    // Calculate gross total income
    const grossTotalIncome =
      (income.salary?.totalSalary || 0) +
      (income.houseProperty?.netRentalIncome || 0) +
      (income.capitalGains?.shortTerm || 0) +
      (income.capitalGains?.longTerm || 0) +
      (income.otherSources?.total || 0);

    // Calculate total deductions
    const totalDeductions =
      (deductions.section80C?.totalAmount || 0) +
      (deductions.section80D?.totalAmount || 0) +
      (deductions.section24?.interest || 0) +
      50000; // Standard deduction

    const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

    // Calculate tax using slabs (simplified)
    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = 187500 + (taxableIncome - 1500000) * 0.3;
    } else if (taxableIncome > 1250000) {
      tax = 125000 + (taxableIncome - 1250000) * 0.25;
    } else if (taxableIncome > 1000000) {
      tax = 75000 + (taxableIncome - 1000000) * 0.2;
    } else if (taxableIncome > 750000) {
      tax = 37500 + (taxableIncome - 750000) * 0.15;
    } else if (taxableIncome > 500000) {
      tax = 12500 + (taxableIncome - 500000) * 0.1;
    } else if (taxableIncome > 250000) {
      tax = (taxableIncome - 250000) * 0.05;
    }

    // Rebate u/s 87A
    let rebate87A = 0;
    if (taxableIncome <= 500000) {
      rebate87A = Math.min(tax, 12500);
    }

    // Calculate cess (4%)
    const cess = Math.round((tax - rebate87A) * 0.04);
    const totalTax = tax - rebate87A + cess;

    // Calculate refund/payable
    const totalTaxesPaid =
      (taxesPaid.tds || 0) + (taxesPaid.advanceTax || 0) + (taxesPaid.selfAssessmentTax || 0);
    const refundAmount = Math.max(0, totalTaxesPaid - totalTax);
    const taxPayable = Math.max(0, totalTax - totalTaxesPaid);

    return {
      success: true,
      grossTotalIncome,
      totalDeductions,
      taxableIncome,
      tax,
      rebate87A,
      cess,
      totalTax,
      totalTaxesPaid,
      refundAmount,
      taxPayable,
      slabBreakdown: this.calculateSlabBreakdown(taxableIncome),
    };
  }

  /**
   * Calculate slab-wise breakdown
   */
  calculateSlabBreakdown(taxableIncome) {
    const slabs = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250001, max: 500000, rate: 5 },
      { min: 500001, max: 750000, rate: 10 },
      { min: 750001, max: 1000000, rate: 15 },
      { min: 1000001, max: 1250000, rate: 20 },
      { min: 1250001, max: 1500000, rate: 25 },
      { min: 1500001, max: Infinity, rate: 30 },
    ];

    const breakdown = [];
    let remainingIncome = taxableIncome;

    for (const slab of slabs) {
      if (remainingIncome <= 0) break;

      const slabIncome = Math.min(
        remainingIncome,
        slab.max === Infinity ? remainingIncome : slab.max - slab.min + 1,
      );
      const slabTax = (slabIncome * slab.rate) / 100;

      if (slabIncome > 0) {
        breakdown.push({
          slab: `${slab.min.toLocaleString('en-IN')} - ${
            slab.max === Infinity ? '∞' : slab.max.toLocaleString('en-IN')
          }`,
          income: slabIncome,
          rate: slab.rate,
          tax: slabTax,
        });
      }

      remainingIncome -= slabIncome;
    }

    return breakdown;
  }
}

export const computationService = new ComputationService();

