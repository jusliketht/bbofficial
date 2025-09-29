// Justification: Tax Computation Unit Tests - Comprehensive testing of tax calculation logic
// Tests all tax computation scenarios including old/new regimes, different income levels
// Essential for ensuring accurate tax calculations and compliance with tax laws
// Covers edge cases, boundary conditions, and various ITR types

const { TaxComputationService } = require('../../src/services/taxComputationService');
const TestDataGenerator = require('../utils/test-data-generator');

// Justification: Mock database dependencies for unit testing
// Ensures tests run independently without database dependencies
// Provides predictable test environment
jest.mock('../../src/database/migrate_ddl', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Tax Computation Service', () => {
  let taxService;
  
  beforeEach(() => {
    taxService = new TaxComputationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly for ITR-1 with old regime', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 500000,
        house_property_income: 0,
        other_income: 0,
        standard_deduction: 50000,
        section_80c: 150000,
        section_80d: 25000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.regime).toBe('OLD');
      expect(result.totalIncome).toBe(500000);
      expect(result.totalDeductions).toBe(225000); // 50000 + 150000 + 25000
      expect(result.taxableIncome).toBe(275000);
      expect(result.taxLiability).toBe(5000); // 5% of 100000 (275000 - 250000)
      expect(result.cess).toBe(200); // 4% of 5000
      expect(result.finalTax).toBe(5200);
    });

    it('should calculate tax correctly for ITR-1 with new regime', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        house_property_income: 0,
        other_income: 0,
        standard_deduction: 50000
      });
      
      const result = await taxService.calculateTax(incomeData, 'NEW');
      
      expect(result.regime).toBe('NEW');
      expect(result.totalIncome).toBe(1000000);
      expect(result.totalDeductions).toBe(50000); // Only standard deduction
      expect(result.taxableIncome).toBe(950000);
      expect(result.taxLiability).toBe(75000); // New regime calculation
      expect(result.cess).toBe(3000); // 4% of 75000
      expect(result.finalTax).toBe(78000);
    });

    it('should handle zero income correctly', async () => {
      const incomeData = TestDataGenerator.generateEdgeCaseData('zero_income');
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.taxLiability).toBe(0);
      expect(result.finalTax).toBe(0);
    });

    it('should handle maximum deductions correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        standard_deduction: 50000,
        section_80c: 150000,
        section_80d: 25000,
        section_80g: 10000,
        section_80e: 200000,
        section_80tta: 10000,
        section_80ttb: 50000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalDeductions).toBe(495000); // All deductions
      expect(result.taxableIncome).toBe(505000);
      expect(result.taxLiability).toBe(25000); // 5% of 50000 (505000 - 500000)
    });

    it('should handle high income with surcharge correctly', async () => {
      const incomeData = TestDataGenerator.generateEdgeCaseData('high_income');
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalIncome).toBe(8700000); // 5M + 500K + 2M + 1M + 200K
      expect(result.taxableIncome).toBeGreaterThan(5000000); // Above surcharge threshold
      expect(result.surcharge).toBeGreaterThan(0);
      expect(result.finalTax).toBeGreaterThan(result.taxLiability);
    });

    it('should apply rebate under section 87A correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 300000,
        standard_deduction: 50000,
        section_80c: 150000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.taxableIncome).toBe(100000);
      expect(result.taxLiability).toBe(0); // Below 250000 threshold
      expect(result.rebate87A).toBe(0);
      expect(result.finalTax).toBe(0);
    });

    it('should handle ITR-2 with capital gains correctly', async () => {
      const incomeData = TestDataGenerator.generateITR2Data({
        salary_income: 800000,
        house_property_income: 120000,
        capital_gains_income: 200000,
        other_income: 50000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalIncome).toBe(1170000);
      expect(result.capitalGainsIncome).toBe(200000);
      expect(result.taxLiability).toBeGreaterThan(0);
    });

    it('should handle ITR-3 with business income correctly', async () => {
      const incomeData = TestDataGenerator.generateITR3Data({
        salary_income: 600000,
        house_property_income: 80000,
        business_profession_income: 500000,
        capital_gains_income: 100000,
        other_income: 30000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalIncome).toBe(1290000);
      expect(result.businessIncome).toBe(500000);
      expect(result.taxLiability).toBeGreaterThan(0);
    });

    it('should handle ITR-4 with presumptive income correctly', async () => {
      const incomeData = TestDataGenerator.generateITR4Data({
        salary_income: 400000,
        house_property_income: 60000,
        business_profession_income: 800000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalIncome).toBe(1260000);
      expect(result.presumptiveIncome).toBe(800000);
      expect(result.taxLiability).toBeGreaterThan(0);
    });

    it('should handle NRI scenario correctly', async () => {
      const incomeData = TestDataGenerator.generateEdgeCaseData('nri_scenario', {
        salary_income: 500000,
        foreign_income: 100000,
        foreign_tax_paid: 20000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.totalIncome).toBe(600000);
      expect(result.foreignIncome).toBe(100000);
      expect(result.foreignTaxCredit).toBe(20000);
      expect(result.finalTax).toBeGreaterThan(0);
    });

    it('should validate input data correctly', async () => {
      const invalidIncomeData = {
        salary_income: -1000, // Invalid negative income
        standard_deduction: 50000
      };
      
      await expect(taxService.calculateTax(invalidIncomeData, 'OLD'))
        .rejects.toThrow('Invalid income data');
    });

    it('should handle missing income fields gracefully', async () => {
      const incompleteIncomeData = {
        salary_income: 500000
        // Missing other income fields
      };
      
      const result = await taxService.calculateTax(incompleteIncomeData, 'OLD');
      
      expect(result.totalIncome).toBe(500000);
      expect(result.housePropertyIncome).toBe(0);
      expect(result.businessIncome).toBe(0);
      expect(result.capitalGainsIncome).toBe(0);
      expect(result.otherIncome).toBe(0);
    });

    it('should calculate tax for different age groups correctly', async () => {
      // Senior citizen (60-80 years)
      const seniorCitizenData = TestDataGenerator.generateITR1Data({
        salary_income: 400000,
        age: 65
      });
      
      const seniorResult = await taxService.calculateTax(seniorCitizenData, 'OLD');
      
      // Super senior citizen (80+ years)
      const superSeniorData = TestDataGenerator.generateITR1Data({
        salary_income: 600000,
        age: 85
      });
      
      const superSeniorResult = await taxService.calculateTax(superSeniorData, 'OLD');
      
      expect(seniorResult.ageGroup).toBe('SENIOR_CITIZEN');
      expect(superSeniorResult.ageGroup).toBe('SUPER_SENIOR_CITIZEN');
      expect(seniorResult.taxLiability).toBeLessThan(superSeniorResult.taxLiability);
    });

    it('should handle different assessment years correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 500000,
        assessment_year: 2024
      });
      
      const result2024 = await taxService.calculateTax(incomeData, 'OLD', 2024);
      const result2025 = await taxService.calculateTax(incomeData, 'OLD', 2025);
      
      expect(result2024.assessmentYear).toBe(2024);
      expect(result2025.assessmentYear).toBe(2025);
      // Tax slabs might be different for different years
    });

    it('should calculate advance tax correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        advance_tax_paid: 50000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.advanceTaxPaid).toBe(50000);
      expect(result.taxPayable).toBe(result.finalTax - 50000);
    });

    it('should handle TDS correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        tds_salary: 75000,
        tds_other: 5000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.tdsSalary).toBe(75000);
      expect(result.tdsOther).toBe(5000);
      expect(result.totalTDS).toBe(80000);
      expect(result.taxPayable).toBe(result.finalTax - 80000);
    });

    it('should handle self-assessment tax correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        self_assessment_tax_paid: 10000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.selfAssessmentTaxPaid).toBe(10000);
      expect(result.taxPayable).toBe(result.finalTax - 10000);
    });

    it('should calculate refund correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 500000,
        tds_salary: 100000 // More TDS than actual tax
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.taxPayable).toBeLessThan(0);
      expect(result.refund).toBe(Math.abs(result.taxPayable));
    });

    it('should handle multiple house properties correctly', async () => {
      const incomeData = TestDataGenerator.generateITR2Data({
        salary_income: 500000,
        house_property_income: 120000,
        house_properties: [
          { annual_value: 100000, municipal_taxes: 10000, interest_on_loan: 50000 },
          { annual_value: 80000, municipal_taxes: 8000, interest_on_loan: 30000 }
        ]
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.housePropertyIncome).toBe(120000);
      expect(result.houseProperties.length).toBe(2);
    });

    it('should handle long-term and short-term capital gains correctly', async () => {
      const incomeData = TestDataGenerator.generateITR2Data({
        salary_income: 500000,
        capital_gains_income: 200000,
        capital_gains: [
          { gain_type: 'long_term', amount: 150000, tax_rate: 20 },
          { gain_type: 'short_term', amount: 50000, tax_rate: 15 }
        ]
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.longTermCapitalGains).toBe(150000);
      expect(result.shortTermCapitalGains).toBe(50000);
      expect(result.capitalGainsTax).toBe(37500); // (150000 * 20%) + (50000 * 15%)
    });

    it('should handle business income with depreciation correctly', async () => {
      const incomeData = TestDataGenerator.generateITR3Data({
        salary_income: 500000,
        business_profession_income: 500000,
        business_details: {
          gross_receipts: 1000000,
          expenses: 300000,
          depreciation: 50000
        }
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.businessIncome).toBe(500000);
      expect(result.businessDetails.depreciation).toBe(50000);
    });

    it('should handle presumptive taxation sections correctly', async () => {
      const incomeData = TestDataGenerator.generateITR4Data({
        salary_income: 500000,
        business_profession_income: 800000,
        presumptive_details: {
          section_44ad: true,
          gross_receipts: 1000000,
          presumptive_income: 80000
        }
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.presumptiveIncome).toBe(80000);
      expect(result.presumptiveDetails.section_44ad).toBe(true);
    });

    it('should handle foreign income with tax treaty correctly', async () => {
      const incomeData = TestDataGenerator.generateITR2Data({
        salary_income: 500000,
        foreign_income: 100000,
        foreign_tax_paid: 20000,
        treaty_relief: 5000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.foreignIncome).toBe(100000);
      expect(result.foreignTaxCredit).toBe(20000);
      expect(result.treatyRelief).toBe(5000);
    });

    it('should validate regime selection correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 500000
      });
      
      await expect(taxService.calculateTax(incomeData, 'INVALID'))
        .rejects.toThrow('Invalid tax regime');
    });

    it('should handle concurrent tax calculations correctly', async () => {
      const incomeData1 = TestDataGenerator.generateITR1Data({ salary_income: 500000 });
      const incomeData2 = TestDataGenerator.generateITR1Data({ salary_income: 800000 });
      
      const [result1, result2] = await Promise.all([
        taxService.calculateTax(incomeData1, 'OLD'),
        taxService.calculateTax(incomeData2, 'OLD')
      ]);
      
      expect(result1.totalIncome).toBe(500000);
      expect(result2.totalIncome).toBe(800000);
      expect(result2.taxLiability).toBeGreaterThan(result1.taxLiability);
    });

    it('should provide detailed tax breakdown', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        standard_deduction: 50000,
        section_80c: 150000,
        section_80d: 25000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.incomeBreakdown).toBeDefined();
      expect(result.breakdown.deductionBreakdown).toBeDefined();
      expect(result.breakdown.taxBreakdown).toBeDefined();
    });

    it('should handle rounding correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 500001, // Odd amount to test rounding
        standard_deduction: 50000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      
      expect(result.taxLiability).toBe(Math.round(result.taxLiability));
      expect(result.cess).toBe(Math.round(result.cess));
      expect(result.finalTax).toBe(Math.round(result.finalTax));
    });
  });

  describe('compareRegimes', () => {
    it('should compare old and new regimes correctly', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        standard_deduction: 50000,
        section_80c: 150000,
        section_80d: 25000
      });
      
      const comparison = await taxService.compareRegimes(incomeData);
      
      expect(comparison.oldRegime).toBeDefined();
      expect(comparison.newRegime).toBeDefined();
      expect(comparison.recommendedRegime).toBeDefined();
      expect(comparison.savings).toBeDefined();
    });

    it('should recommend new regime for high income with low deductions', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 2000000,
        standard_deduction: 50000,
        section_80c: 0,
        section_80d: 0
      });
      
      const comparison = await taxService.compareRegimes(incomeData);
      
      expect(comparison.recommendedRegime).toBe('NEW');
      expect(comparison.savings).toBeGreaterThan(0);
    });

    it('should recommend old regime for high deductions', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 1000000,
        standard_deduction: 50000,
        section_80c: 150000,
        section_80d: 25000,
        section_80g: 10000,
        section_80e: 200000
      });
      
      const comparison = await taxService.compareRegimes(incomeData);
      
      expect(comparison.recommendedRegime).toBe('OLD');
      expect(comparison.savings).toBeGreaterThan(0);
    });
  });

  describe('validateTaxComputation', () => {
    it('should validate tax computation results', async () => {
      const incomeData = TestDataGenerator.generateITR1Data({
        salary_income: 500000
      });
      
      const result = await taxService.calculateTax(incomeData, 'OLD');
      const validation = await taxService.validateTaxComputation(result);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid tax computations', async () => {
      const invalidResult = {
        totalIncome: 500000,
        taxableIncome: 600000, // Invalid: taxable income > total income
        taxLiability: -1000 // Invalid: negative tax
      };
      
      const validation = await taxService.validateTaxComputation(invalidResult);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
