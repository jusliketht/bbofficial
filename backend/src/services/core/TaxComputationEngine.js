// =====================================================
// TAX COMPUTATION ENGINE
// =====================================================

const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');
const BusinessIncomeCalculator = require('../business/BusinessIncomeCalculator');
const ProfessionalIncomeCalculator = require('../business/ProfessionalIncomeCalculator');

class TaxComputationEngine {
  constructor() {
    this.taxSlabs = {
      '2024-25': {
        individual: [
          { min: 0, max: 250000, rate: 0, cess: 0 },
          { min: 250001, max: 500000, rate: 5, cess: 4 },
          { min: 500001, max: 750000, rate: 10, cess: 4 },
          { min: 750001, max: 1000000, rate: 15, cess: 4 },
          { min: 1000001, max: 1250000, rate: 20, cess: 4 },
          { min: 1250001, max: 1500000, rate: 25, cess: 4 },
          { min: 1500001, max: Infinity, rate: 30, cess: 4 },
        ],
        seniorCitizen: [
          { min: 0, max: 300000, rate: 0, cess: 0 },
          { min: 300001, max: 500000, rate: 5, cess: 4 },
          { min: 500001, max: 750000, rate: 10, cess: 4 },
          { min: 750001, max: 1000000, rate: 15, cess: 4 },
          { min: 1000001, max: 1250000, rate: 20, cess: 4 },
          { min: 1250001, max: 1500000, rate: 25, cess: 4 },
          { min: 1500001, max: Infinity, rate: 30, cess: 4 },
        ],
        superSeniorCitizen: [
          { min: 0, max: 500000, rate: 0, cess: 0 },
          { min: 500001, max: 750000, rate: 10, cess: 4 },
          { min: 750001, max: 1000000, rate: 15, cess: 4 },
          { min: 1000001, max: 1250000, rate: 20, cess: 4 },
          { min: 1250001, max: 1500000, rate: 25, cess: 4 },
          { min: 1500001, max: Infinity, rate: 30, cess: 4 },
        ],
      },
    };

    this.deductionLimits = {
      '2024-25': {
        section80C: 150000,
        section80D: 25000,
        section80E: Infinity, // No limit
        section80G: Infinity, // No limit
        section80TTA: 10000,
        section80TTB: 50000,
        section24: 200000,
        standardDeduction: 50000,
      },
    };

    enterpriseLogger.info('TaxComputationEngine initialized');
  }

  /**
   * Compute tax for ITR filing
   * @param {object} filingData - Complete filing data
   * @param {string} assessmentYear - Assessment year
   * @returns {Promise<object>} - Tax computation result
   */
  async computeTax(filingData, assessmentYear = '2024-25') {
    try {
      enterpriseLogger.info('Starting tax computation', {
        itrType: filingData.itrType,
        assessmentYear,
      });

      const computation = {
        assessmentYear,
        itrType: filingData.itrType,
        grossTotalIncome: 0,
        totalDeductions: 0,
        taxableIncome: 0,
        taxComputation: {},
        totalTax: 0,
        cess: 0,
        finalTax: 0,
        refundAmount: 0,
        taxPaid: 0,
        computedAt: new Date().toISOString(),
      };

      // Calculate gross total income
      computation.grossTotalIncome = this.calculateGrossTotalIncome(filingData);

      // Calculate total deductions
      computation.totalDeductions = this.calculateTotalDeductions(filingData, assessmentYear);

      // Calculate taxable income
      computation.taxableIncome = Math.max(0, computation.grossTotalIncome - computation.totalDeductions);

      // Calculate tax based on ITR type
      computation.taxComputation = this.calculateTaxByType(
        computation.taxableIncome,
        filingData.personalInfo,
        assessmentYear,
      );

      computation.totalTax = computation.taxComputation.totalTax;
      computation.cess = computation.taxComputation.cess;

      // Calculate rebate u/s 87A
      computation.rebate87A = this.calculateRebate87A(
        computation.taxComputation.totalTax,
        computation.taxableIncome
      );

      // Calculate relief u/s 89 (if applicable)
      computation.relief89 = this.calculateRelief89(
        filingData,
        computation.taxableIncome,
        assessmentYear
      );

      // Final tax after rebate and relief
      computation.finalTax = Math.max(
        0,
        computation.totalTax + computation.cess - computation.rebate87A.amount - computation.relief89.amount
      );

      // Calculate interest (234A/234B/234C)
      computation.interest = this.calculateInterest(
        computation.finalTax,
        filingData.taxesPaid,
        filingData.submissionDate || new Date(),
        assessmentYear
      );

      // Calculate refund/payable
      computation.taxPaid = filingData.taxPaid || 0;
      computation.refundAmount = Math.max(0, computation.taxPaid - computation.finalTax - computation.interest.total);

      enterpriseLogger.info('Tax computation completed', {
        grossTotalIncome: computation.grossTotalIncome,
        totalDeductions: computation.totalDeductions,
        taxableIncome: computation.taxableIncome,
        totalTax: computation.totalTax,
        finalTax: computation.finalTax,
      });

      return computation;
    } catch (error) {
      enterpriseLogger.error('Tax computation failed', {
        error: error.message,
        filingData: filingData.itrType,
      });
      throw new AppError(`Tax computation failed: ${error.message}`, 500);
    }
  }

  /**
   * Calculate gross total income from all sources
   * @param {object} filingData - Filing data
   * @returns {number} - Gross total income
   */
  calculateGrossTotalIncome(filingData) {
    let totalIncome = 0;

    // Salary income
    if (filingData.income?.salary?.totalSalary) {
      totalIncome += parseFloat(filingData.income.salary.totalSalary) || 0;
    }

    // House property income
    if (filingData.income?.houseProperty?.netRentalIncome) {
      totalIncome += parseFloat(filingData.income.houseProperty.netRentalIncome) || 0;
    }

    // Capital gains
    if (filingData.income?.capitalGains?.shortTerm) {
      totalIncome += parseFloat(filingData.income.capitalGains.shortTerm) || 0;
    }
    if (filingData.income?.capitalGains?.longTerm) {
      totalIncome += parseFloat(filingData.income.capitalGains.longTerm) || 0;
    }

    // Business income - Handle ITR-3, ITR-4, and simple structures
    if (filingData.businessIncome?.businesses && Array.isArray(filingData.businessIncome.businesses)) {
      // ITR-3: Multiple businesses with P&L
      totalIncome += BusinessIncomeCalculator.calculateTotalBusinessIncome(filingData.businessIncome.businesses);
    } else if (filingData.income?.businessIncome || filingData.income?.presumptiveBusiness) {
      // ITR-4: Presumptive business income (8% of gross receipts)
      if (filingData.itrType === 'ITR-4' || filingData.itrType === 'ITR4') {
        const grossReceipts = parseFloat(filingData.income.presumptiveBusiness || filingData.income.businessIncome || 0);
        const presumptiveRate = 0.08; // 8% for business
        totalIncome += grossReceipts * presumptiveRate;
      } else if (typeof filingData.income.businessIncome === 'object' && filingData.income.businessIncome.netProfit) {
        totalIncome += parseFloat(filingData.income.businessIncome.netProfit) || 0;
      } else {
        totalIncome += parseFloat(filingData.income.businessIncome) || 0;
      }
    }

    // Professional income - Handle ITR-3, ITR-4, and simple structures
    if (filingData.professionalIncome?.professions && Array.isArray(filingData.professionalIncome.professions)) {
      // ITR-3: Multiple professions with P&L
      totalIncome += ProfessionalIncomeCalculator.calculateTotalProfessionalIncome(filingData.professionalIncome.professions);
    } else if (filingData.income?.professionalIncome || filingData.income?.presumptiveProfessional) {
      // ITR-4: Presumptive professional income (50% of gross receipts)
      if (filingData.itrType === 'ITR-4' || filingData.itrType === 'ITR4') {
        const grossReceipts = parseFloat(filingData.income.presumptiveProfessional || filingData.income.professionalIncome || 0);
        const presumptiveRate = 0.50; // 50% for profession
        totalIncome += grossReceipts * presumptiveRate;
      } else if (typeof filingData.income.professionalIncome === 'object' && filingData.income.professionalIncome.netIncome) {
        totalIncome += parseFloat(filingData.income.professionalIncome.netIncome) || 0;
      } else {
        totalIncome += parseFloat(filingData.income.professionalIncome) || 0;
      }
    }

    // Other income
    if (filingData.income?.otherIncome) {
      Object.values(filingData.income.otherIncome).forEach(amount => {
        totalIncome += parseFloat(amount) || 0;
      });
    }

    return totalIncome;
  }

  /**
   * Calculate total deductions with limits
   * @param {object} filingData - Filing data
   * @param {string} assessmentYear - Assessment year
   * @returns {number} - Total deductions
   */
  calculateTotalDeductions(filingData, assessmentYear) {
    const limits = this.deductionLimits[assessmentYear];
    let totalDeductions = 0;

    // Section 80C (max ₹1,50,000)
    if (filingData.deductions?.section80C) {
      const section80C = Object.values(filingData.deductions.section80C)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      totalDeductions += Math.min(section80C, limits.section80C);
    }

    // Section 80D (max ₹25,000)
    if (filingData.deductions?.section80D) {
      const section80D = Object.values(filingData.deductions.section80D)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      totalDeductions += Math.min(section80D, limits.section80D);
    }

    // Section 80E (no limit)
    if (filingData.deductions?.section80E?.educationLoanInterest) {
      totalDeductions += parseFloat(filingData.deductions.section80E.educationLoanInterest) || 0;
    }

    // Section 80G (no limit)
    if (filingData.deductions?.section80G?.donations) {
      totalDeductions += parseFloat(filingData.deductions.section80G.donations) || 0;
    }

    // Section 80TTA (max ₹10,000)
    if (filingData.deductions?.section80TTA?.savingsInterest) {
      const section80TTA = parseFloat(filingData.deductions.section80TTA.savingsInterest) || 0;
      totalDeductions += Math.min(section80TTA, limits.section80TTA);
    }

    // Section 80TTB (max ₹50,000 for senior citizens)
    if (filingData.deductions?.section80TTB?.bankInterest) {
      const section80TTB = parseFloat(filingData.deductions.section80TTB.bankInterest) || 0;
      totalDeductions += Math.min(section80TTB, limits.section80TTB);
    }

    // Section 24 (max ₹2,00,000)
    if (filingData.deductions?.section24?.homeLoanInterest) {
      const section24 = parseFloat(filingData.deductions.section24.homeLoanInterest) || 0;
      totalDeductions += Math.min(section24, limits.section24);
    }

    // Standard deduction
    if (filingData.deductions?.otherDeductions?.standardDeduction) {
      totalDeductions += parseFloat(filingData.deductions.otherDeductions.standardDeduction) || 0;
    }

    // HRA, LTA, Medical reimbursement
    if (filingData.deductions?.otherDeductions) {
      const otherDeductions = filingData.deductions.otherDeductions;
      totalDeductions += parseFloat(otherDeductions.hra) || 0;
      totalDeductions += parseFloat(otherDeductions.lta) || 0;
      totalDeductions += parseFloat(otherDeductions.medicalReimbursement) || 0;
    }

    return totalDeductions;
  }

  /**
   * Calculate tax based on taxpayer type
   * @param {number} taxableIncome - Taxable income
   * @param {object} personalInfo - Personal information
   * @param {string} assessmentYear - Assessment year
   * @returns {object} - Tax computation details
   */
  calculateTaxByType(taxableIncome, personalInfo, assessmentYear) {
    const slabs = this.taxSlabs[assessmentYear];
    let applicableSlabs = slabs.individual;

    // Determine taxpayer type based on age
    const age = this.calculateAge(personalInfo.dateOfBirth);
    if (age >= 80) {
      applicableSlabs = slabs.superSeniorCitizen;
    } else if (age >= 60) {
      applicableSlabs = slabs.seniorCitizen;
    }

    let totalTax = 0;
    const taxBreakdown = [];

    for (const slab of applicableSlabs) {
      if (taxableIncome > slab.min) {
        const taxableInThisSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
        const taxInThisSlab = (taxableInThisSlab * slab.rate) / 100;

        if (taxInThisSlab > 0) {
          totalTax += taxInThisSlab;
          taxBreakdown.push({
            slab: `${slab.min.toLocaleString()} - ${slab.max === Infinity ? 'Above' : slab.max.toLocaleString()}`,
            rate: `${slab.rate}%`,
            taxableAmount: taxableInThisSlab,
            tax: taxInThisSlab,
          });
        }
      }
    }

    const cess = (totalTax * 4) / 100; // 4% cess

    return {
      totalTax,
      cess,
      taxBreakdown,
      applicableSlabs: applicableSlabs,
      taxpayerType: age >= 80 ? 'superSeniorCitizen' : age >= 60 ? 'seniorCitizen' : 'individual',
    };
  }

  /**
   * Calculate age from date of birth
   * @param {string} dateOfBirth - Date of birth
   * @returns {number} - Age
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) {return 0;}
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Calculate rebate u/s 87A
   * @param {number} tax - Tax amount before rebate
   * @param {number} taxableIncome - Taxable income
   * @returns {object} - Rebate details
   */
  calculateRebate87A(tax, taxableIncome) {
    // Rebate u/s 87A: Maximum ₹12,500 if taxable income ≤ ₹5,00,000
    if (taxableIncome <= 500000) {
      return {
        applicable: true,
        amount: Math.min(tax, 12500),
        maxAmount: 12500,
        section: '87A',
      };
    }
    return {
      applicable: false,
      amount: 0,
      maxAmount: 12500,
      section: '87A',
    };
  }

  /**
   * Calculate relief u/s 89
   * @param {object} filingData - Filing data
   * @param {number} taxableIncome - Taxable income
   * @param {string} assessmentYear - Assessment year
   * @returns {object} - Relief details
   */
  calculateRelief89(filingData, taxableIncome, assessmentYear) {
    // Relief u/s 89 is applicable when salary is received in arrears or advance
    // This is a simplified calculation - actual calculation is more complex
    const salaryArrears = filingData.income?.salary?.arrears || 0;
    const salaryAdvance = filingData.income?.salary?.advance || 0;

    if (salaryArrears === 0 && salaryAdvance === 0) {
      return {
        applicable: false,
        amount: 0,
        section: '89',
        details: null,
      };
    }

    // Simplified relief calculation
    // In practice, this requires comparing tax liability with and without arrears/advance
    const reliefAmount = Math.min((salaryArrears + salaryAdvance) * 0.1, 50000);

    return {
      applicable: true,
      amount: reliefAmount,
      section: '89',
      details: {
        arrears: salaryArrears,
        advance: salaryAdvance,
        calculatedRelief: reliefAmount,
      },
    };
  }

  /**
   * Calculate interest u/s 234A, 234B, 234C
   * @param {number} taxLiability - Total tax liability
   * @param {object} taxesPaid - Taxes paid details
   * @param {Date} submissionDate - ITR submission date
   * @param {string} assessmentYear - Assessment year
   * @returns {object} - Interest details
   */
  calculateInterest(taxLiability, taxesPaid, submissionDate, assessmentYear) {
    const interest = {
      section234A: { amount: 0, rate: 1, description: 'Interest for delay in filing return' },
      section234B: { amount: 0, rate: 1, description: 'Interest for default in payment of advance tax' },
      section234C: { amount: 0, rate: 1, description: 'Interest for deferment of advance tax' },
      total: 0,
    };

    if (!taxesPaid) {
      return interest;
    }

    const dueDate = this.getDueDate(assessmentYear);
    const submission = new Date(submissionDate);
    const daysLate = Math.max(0, Math.floor((submission - dueDate) / (1000 * 60 * 60 * 24)));

    // Section 234A: Interest for delay in filing (1% per month)
    if (daysLate > 0) {
      const monthsLate = Math.ceil(daysLate / 30);
      interest.section234A.amount = (taxLiability * interest.section234A.rate * monthsLate) / 100;
    }

    // Section 234B: Interest for default in advance tax payment
    const advanceTaxPaid = taxesPaid.advanceTax || 0;
    const requiredAdvanceTax = taxLiability * 0.9; // 90% of tax liability should be paid as advance tax

    if (advanceTaxPaid < requiredAdvanceTax) {
      const shortfall = requiredAdvanceTax - advanceTaxPaid;
      const monthsDefault = Math.ceil(daysLate / 30);
      interest.section234B.amount = (shortfall * interest.section234B.rate * monthsDefault) / 100;
    }

    // Section 234C: Interest for deferment of advance tax (simplified)
    // This requires quarterly advance tax payment details which we don't have here
    // For now, we'll set it to 0 and it can be calculated separately if needed
    interest.section234C.amount = 0;

    interest.total = interest.section234A.amount + interest.section234B.amount + interest.section234C.amount;

    return interest;
  }

  /**
   * Get due date for ITR filing
   * @param {string} assessmentYear - Assessment year (e.g., '2024-25')
   * @returns {Date} - Due date
   */
  getDueDate(assessmentYear) {
    // For AY 2024-25, due date is typically July 31, 2024
    // This is a simplified version - actual logic should consider ITR type and other factors
    const year = parseInt(assessmentYear.split('-')[0]);
    return new Date(year, 6, 31); // July 31
  }

  /**
   * Validate tax computation
   * @param {object} computation - Tax computation result
   * @returns {object} - Validation result
   */
  validateComputation(computation) {
    const errors = [];
    const warnings = [];

    // Basic validations
    if (computation.grossTotalIncome < 0) {
      errors.push('Gross total income cannot be negative');
    }

    if (computation.totalDeductions < 0) {
      errors.push('Total deductions cannot be negative');
    }

    if (computation.taxableIncome < 0) {
      errors.push('Taxable income cannot be negative');
    }

    if (computation.totalTax < 0) {
      errors.push('Tax amount cannot be negative');
    }

    // Warnings
    if (computation.grossTotalIncome > 10000000) {
      warnings.push('High income detected - consider professional tax planning');
    }

    if (computation.totalDeductions > computation.grossTotalIncome * 0.8) {
      warnings.push('High deduction ratio - verify deduction claims');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Compute tax with simulation changes
   * @param {object} baseFormData - Base form data
   * @param {object} simulationChanges - Changes to apply for simulation
   * @returns {Promise<object>} - Tax computation with simulation
   */
  async computeWithSimulation(baseFormData, simulationChanges) {
    try {
      enterpriseLogger.info('Computing tax with simulation changes');

      // Merge simulation changes into base form data
      const simulatedFormData = this.mergeSimulationChanges(baseFormData, simulationChanges);

      // Compute tax with simulated data
      const simulatedComputation = await this.computeTax(
        simulatedFormData,
        simulatedFormData.assessmentYear || baseFormData.assessmentYear || '2024-25'
      );

      return simulatedComputation;
    } catch (error) {
      enterpriseLogger.error('Failed to compute tax with simulation', {
        error: error.message,
      });
      throw new AppError(`Failed to compute simulation: ${error.message}`, 500);
    }
  }

  /**
   * Calculate savings from simulation
   * @param {object} baseTax - Base tax computation
   * @param {object} simulatedTax - Simulated tax computation
   * @returns {object} - Savings breakdown
   */
  calculateSavings(baseTax, simulatedTax) {
    const baseTaxLiability = parseFloat(baseTax.totalTaxLiability || baseTax.finalTax || 0);
    const simulatedTaxLiability = parseFloat(simulatedTax.totalTaxLiability || simulatedTax.finalTax || 0);

    const totalSavings = baseTaxLiability - simulatedTaxLiability;
    const savingsPercentage = baseTaxLiability > 0
      ? (totalSavings / baseTaxLiability) * 100
      : 0;

    return {
      totalSavings: Math.max(0, totalSavings),
      savingsPercentage: Math.max(0, savingsPercentage),
      baseTaxLiability,
      simulatedTaxLiability,
      breakdown: {
        incomeTax: (parseFloat(baseTax.taxComputation?.totalTax || baseTax.totalTax || 0) - 
                   parseFloat(simulatedTax.taxComputation?.totalTax || simulatedTax.totalTax || 0)),
        cess: (parseFloat(baseTax.cess || 0) - parseFloat(simulatedTax.cess || 0)),
        surcharge: (parseFloat(baseTax.taxComputation?.surcharge || 0) - 
                   parseFloat(simulatedTax.taxComputation?.surcharge || 0)),
      },
    };
  }

  /**
   * Validate simulation scenario
   * @param {object} scenario - Simulation scenario
   * @returns {object} - Validation result
   */
  validateSimulationScenario(scenario) {
    const errors = [];

    if (!scenario.type) {
      errors.push('Scenario type is required');
    }

    if (!scenario.changes) {
      errors.push('Scenario changes are required');
    }

    // Validate scenario type-specific requirements
    if (scenario.type === 'section80C' && (!scenario.changes.amount || scenario.changes.amount <= 0)) {
      errors.push('Investment amount is required for Section 80C scenario');
    }

    if (scenario.type === 'section80CCD' && (!scenario.changes.amount || scenario.changes.amount <= 0)) {
      errors.push('NPS contribution amount is required for Section 80CCD scenario');
    }

    if (scenario.type === 'section80D' && (!scenario.changes.amount || scenario.changes.amount <= 0)) {
      errors.push('Health insurance premium amount is required for Section 80D scenario');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge simulation changes into form data
   * @param {object} baseFormData - Base form data
   * @param {object} simulationChanges - Changes to apply
   * @returns {object} - Merged form data
   */
  mergeSimulationChanges(baseFormData, simulationChanges) {
    const merged = JSON.parse(JSON.stringify(baseFormData)); // Deep clone

    // Apply changes based on scenario type
    if (simulationChanges.type === 'section80C') {
      if (!merged.deductions) merged.deductions = {};
      merged.deductions.section80C = (parseFloat(merged.deductions.section80C || 0) + 
                                       parseFloat(simulationChanges.changes.amount || 0));
      merged.deductions.section80C = Math.min(150000, merged.deductions.section80C);
    } else if (simulationChanges.type === 'section80CCD') {
      if (!merged.deductions) merged.deductions = {};
      merged.deductions.section80CCD = (parseFloat(merged.deductions.section80CCD || 0) + 
                                        parseFloat(simulationChanges.changes.amount || 0));
      merged.deductions.section80CCD = Math.min(50000, merged.deductions.section80CCD);
    } else if (simulationChanges.type === 'section80D') {
      if (!merged.deductions) merged.deductions = {};
      merged.deductions.section80D = (parseFloat(merged.deductions.section80D || 0) + 
                                      parseFloat(simulationChanges.changes.amount || 0));
      merged.deductions.section80D = Math.min(25000, merged.deductions.section80D);
    } else if (simulationChanges.type === 'hraOptimization') {
      if (!merged.income) merged.income = {};
      if (!merged.income.salary) merged.income.salary = {};
      if (simulationChanges.changes.rentPaid !== undefined) {
        merged.income.salary.rentPaid = parseFloat(simulationChanges.changes.rentPaid);
      }
      if (simulationChanges.changes.hra !== undefined) {
        merged.income.salary.hra = parseFloat(simulationChanges.changes.hra);
      }
    } else if (simulationChanges.type === 'section24') {
      if (!merged.income) merged.income = {};
      if (!merged.income.houseProperty) merged.income.houseProperty = {};
      merged.income.houseProperty.interestOnLoan = (parseFloat(merged.income.houseProperty.interestOnLoan || 0) + 
                                                    parseFloat(simulationChanges.changes.interestAmount || 0));
      merged.income.houseProperty.interestOnLoan = Math.min(200000, merged.income.houseProperty.interestOnLoan);
    }

    return merged;
  }
}

module.exports = new TaxComputationEngine();