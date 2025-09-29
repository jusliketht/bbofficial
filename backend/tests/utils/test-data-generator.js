// Justification: Test Data Generator - Comprehensive test data creation utilities
// Provides utilities for generating realistic test data for all ITR types
// Essential for consistent and reliable testing with proper data validation
// Supports various test scenarios including edge cases and compliance testing

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Justification: Test data generator class for consistent test data creation
// Provides methods for generating various types of test data
// Ensures data consistency across different test scenarios
class TestDataGenerator {
  
  // Justification: Generate valid PAN numbers for testing
  // Creates PAN numbers that pass validation but are clearly test data
  // Ensures test data doesn't conflict with real PAN numbers
  static generatePAN() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let pan = 'TEST'; // Prefix to identify test data
    for (let i = 0; i < 4; i++) {
      pan += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    pan += letters.charAt(Math.floor(Math.random() * letters.length));
    
    return pan;
  }

  // Justification: Generate valid Aadhaar numbers for testing
  // Creates Aadhaar numbers that pass format validation
  // Uses test prefix to avoid conflicts with real Aadhaar numbers
  static generateAadhaar() {
    let aadhaar = '9999'; // Test prefix
    for (let i = 0; i < 8; i++) {
      aadhaar += Math.floor(Math.random() * 10);
    }
    return aadhaar;
  }

  // Justification: Generate test mobile numbers
  // Creates mobile numbers that pass validation but are clearly test data
  // Ensures test data doesn't conflict with real mobile numbers
  static generateMobile() {
    const prefixes = ['9999', '8888', '7777']; // Test prefixes
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let mobile = prefix;
    for (let i = 0; i < 6; i++) {
      mobile += Math.floor(Math.random() * 10);
    }
    return mobile;
  }

  // Justification: Generate test email addresses
  // Creates email addresses that pass validation but are clearly test data
  // Ensures test data doesn't conflict with real email addresses
  static generateEmail() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test.user.${timestamp}.${random}@testdomain.com`;
  }

  // Justification: Hash PII data for testing
  // Provides consistent hashing for test data
  // Matches production hashing implementation
  static hashPII(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Justification: Generate test user data
  // Creates comprehensive user data for testing
  // Supports different user types and scenarios
  static generateUserData(overrides = {}) {
    const mobile = this.generateMobile();
    const email = this.generateEmail();
    
    return {
      pan: this.generatePAN(),
      mobile_hash: this.hashPII(mobile),
      email_hash: this.hashPII(email),
      consent_timestamp: new Date().toISOString(),
      consent_ip: '127.0.0.1',
      locale: 'en',
      is_active: true,
      ...overrides
    };
  }

  // Justification: Generate test intake data
  // Creates comprehensive intake data for different ITR types
  // Supports various income levels and scenarios
  static generateIntakeData(overrides = {}) {
    const baseData = {
      ay_code: '2024-25',
      itr_type: 'ITR-1',
      status: 'DRAFT',
      full_name: 'Test User',
      father_name: 'Test Father',
      date_of_birth: '1990-01-01',
      gender: 'M',
      aadhaar: this.generateAadhaar(),
      filing_for: 'self',
      residential_status: 'Resident',
      country_of_residence: 'India',
      address: {
        line1: 'Test Address Line 1',
        line2: 'Test Address Line 2',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      employer_category: 'Other',
      tds_salary: 0,
      tds_other: 0,
      advance_tax_paid: 0,
      self_assessment_tax_paid: 0,
      verification_method: null,
      verification_date: null,
      verified_at: null
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate ITR-1 specific test data
  // Creates data suitable for ITR-1 (Sahaj) testing
  // Includes salary income and basic deductions
  static generateITR1Data(overrides = {}) {
    const baseData = this.generateIntakeData({
      itr_type: 'ITR-1',
      salary_income: 500000,
      house_property_income: 0,
      business_profession_income: 0,
      capital_gains_income: 0,
      other_income: 0,
      standard_deduction: 50000,
      section_80c: 150000,
      section_80d: 25000,
      section_80g: 10000,
      section_80e: 0,
      section_80tta: 10000,
      section_80ttb: 0
    });

    return { ...baseData, ...overrides };
  }

  // Justification: Generate ITR-2 specific test data
  // Creates data suitable for ITR-2 testing
  // Includes capital gains and multiple house properties
  static generateITR2Data(overrides = {}) {
    const baseData = this.generateIntakeData({
      itr_type: 'ITR-2',
      salary_income: 800000,
      house_property_income: 120000,
      business_profession_income: 0,
      capital_gains_income: 200000,
      other_income: 50000,
      standard_deduction: 50000,
      section_80c: 150000,
      section_80d: 25000,
      section_80g: 10000,
      section_80e: 0,
      section_80tta: 10000,
      section_80ttb: 0
    });

    return { ...baseData, ...overrides };
  }

  // Justification: Generate ITR-3 specific test data
  // Creates data suitable for ITR-3 testing
  // Includes business income and complex scenarios
  static generateITR3Data(overrides = {}) {
    const baseData = this.generateIntakeData({
      itr_type: 'ITR-3',
      salary_income: 600000,
      house_property_income: 80000,
      business_profession_income: 500000,
      capital_gains_income: 100000,
      other_income: 30000,
      standard_deduction: 50000,
      section_80c: 150000,
      section_80d: 25000,
      section_80g: 10000,
      section_80e: 0,
      section_80tta: 10000,
      section_80ttb: 0
    });

    return { ...baseData, ...overrides };
  }

  // Justification: Generate ITR-4 specific test data
  // Creates data suitable for ITR-4 (Sugam) testing
  // Includes presumptive business income
  static generateITR4Data(overrides = {}) {
    const baseData = this.generateIntakeData({
      itr_type: 'ITR-4',
      salary_income: 400000,
      house_property_income: 60000,
      business_profession_income: 800000,
      capital_gains_income: 0,
      other_income: 20000,
      standard_deduction: 50000,
      section_80c: 150000,
      section_80d: 25000,
      section_80g: 10000,
      section_80e: 0,
      section_80tta: 10000,
      section_80ttb: 0
    });

    return { ...baseData, ...overrides };
  }

  // Justification: Generate income head data
  // Creates detailed income head entries for testing
  // Supports various income types and amounts
  static generateIncomeHeadData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      head_type: 'SALARY',
      sub_type: 'Basic Salary',
      amount: 500000,
      details: {
        employer_name: 'Test Company',
        employer_pan: this.generatePAN(),
        tds_deducted: 50000
      },
      source_document: 'Form 16'
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate deduction data
  // Creates detailed deduction entries for testing
  // Supports various deduction sections and amounts
  static generateDeductionData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      section: '80C',
      sub_section: 'Life Insurance Premium',
      claimed_amount: 150000,
      eligible_amount: 150000,
      proof_document: 'Premium Receipt',
      details: {
        policy_number: 'TEST123456',
        insurance_company: 'Test Insurance Co.',
        premium_amount: 150000
      }
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate house property data
  // Creates house property entries for ITR-2/3 testing
  // Supports different property types and scenarios
  static generateHousePropertyData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      property_type: 'let_out',
      property_address: 'Test Property Address, Test City, Test State - 123456',
      annual_value: 120000,
      municipal_taxes: 12000,
      interest_on_housing_loan: 200000,
      rent_received: 120000
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate capital gains data
  // Creates capital gains entries for ITR-2/3 testing
  // Supports both short-term and long-term gains
  static generateCapitalGainsData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      gain_type: 'long_term',
      asset_category: 'Equity Shares',
      asset_description: 'Test Company Shares',
      date_of_purchase: '2020-01-01',
      date_of_sale: '2024-01-01',
      cost_of_acquisition: 100000,
      sale_consideration: 300000,
      transfer_expenses: 1000,
      exemptions: 0
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate bank account data
  // Creates bank account entries for testing
  // Supports different account types and scenarios
  static generateBankAccountData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      account_number: '1234567890123456',
      ifsc_code: 'TEST0123456',
      bank_name: 'Test Bank',
      account_holder_name: 'Test User',
      account_type: 'SAVINGS',
      branch_name: 'Test Branch',
      is_primary: true
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate personal info data
  // Creates personal information entries for testing
  // Supports different personal details and scenarios
  static generatePersonalInfoData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      gender: 'M',
      aadhaar: this.generateAadhaar(),
      filing_for: 'self',
      residential_status: 'Resident',
      country_of_residence: 'India',
      address: {
        line1: 'Test Address Line 1',
        line2: 'Test Address Line 2',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      }
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate tax payment data
  // Creates tax payment entries for testing
  // Supports different tax payment scenarios
  static generateTaxPaymentData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      tds_salary: 50000,
      tds_other: 10000,
      advance_tax_paid: 20000,
      self_assessment_tax_paid: 5000,
      payment_details: {
        tds_certificates: ['TDS001', 'TDS002'],
        advance_tax_challans: ['AT001', 'AT002'],
        self_assessment_challan: 'SA001'
      }
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate business profession data
  // Creates business profession entries for ITR-3 testing
  // Supports different business types and scenarios
  static generateBusinessProfessionData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      business_name: 'Test Business',
      business_code: 'TEST001',
      nature_of_business: 'Software Development',
      turnover: 1000000,
      gross_receipts: 1000000,
      gross_profit: 300000,
      expenses: 200000,
      net_profit: 100000,
      nature_of_audit: 'Tax Audit',
      auditor_name: 'Test Auditor',
      auditor_membership_no: 'TEST123',
      auditor_firm_reg_no: 'TEST456'
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate presumptive business data
  // Creates presumptive business entries for ITR-4 testing
  // Supports different presumptive sections
  static generatePresumptiveBusinessData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      nature_of_business: 'Trading',
      business_code: 'TEST002',
      presumptive_section: '44AD',
      gross_receipts: 1500000,
      presumptive_income: 120000,
      gross_profit_percent: 8.0,
      turnover_received_via_account_payee: 1000000,
      turnover_received_by_other_modes: 500000
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate foreign income data
  // Creates foreign income entries for ITR-2/3 testing
  // Supports different countries and income types
  static generateForeignIncomeData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      country: 'United States',
      income_type: 'Salary',
      income_amount: 100000,
      tax_paid_in_foreign_country: 20000,
      treaty_relief: 5000
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate foreign assets data
  // Creates foreign assets entries for ITR-2/3 testing
  // Supports different asset types and countries
  static generateForeignAssetsData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      asset_type: 'Bank Account',
      country: 'United States',
      asset_address: 'Test Bank, New York, USA',
      ownership_date: '2020-01-01',
      income_earned: 5000
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate shareholding data
  // Creates shareholding entries for ITR-2 testing
  // Supports different company types and scenarios
  static generateShareholdingData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      is_director: false,
      company_name: 'Test Company Ltd',
      company_pan: this.generatePAN(),
      is_unlisted: true,
      holding_start_date: '2020-01-01',
      holding_end_date: '2024-01-01'
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate document data
  // Creates document entries for testing
  // Supports different document types and scenarios
  static generateDocumentData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      document_type: 'FORM_16',
      file_name: 'form16_2024.pdf',
      file_size: 1024000,
      file_path: '/uploads/documents/form16_2024.pdf',
      mime_type: 'application/pdf',
      parsed_data: {
        employer_name: 'Test Company',
        employer_pan: this.generatePAN(),
        salary_income: 500000,
        tds_deducted: 50000
      },
      upload_status: 'PARSED'
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate audit event data
  // Creates audit event entries for testing
  // Supports different event types and scenarios
  static generateAuditEventData(userId, intakeId, overrides = {}) {
    const baseData = {
      user_id: userId,
      intake_id: intakeId,
      event_type: 'INTAKE_CREATED',
      event_details: {
        action: 'CREATE',
        entity: 'INTAKE',
        changes: {
          status: 'DRAFT'
        }
      },
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent'
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate consent log data
  // Creates consent log entries for testing
  // Supports different consent types and scenarios
  static generateConsentLogData(userId, intakeId, overrides = {}) {
    const baseData = {
      user_id: userId,
      intake_id: intakeId,
      consent_type: 'DATA_PROCESSING',
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent',
      consent_details: {
        purpose: 'ITR Filing',
        data_types: ['Personal Information', 'Financial Data'],
        retention_period: '7 years'
      }
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate tax computation data
  // Creates tax computation entries for testing
  // Supports different tax regimes and scenarios
  static generateTaxComputationData(intakeId, overrides = {}) {
    const baseData = {
      intake_id: intakeId,
      regime: 'OLD',
      computation_data: {
        total_income: 500000,
        total_deductions: 200000,
        taxable_income: 300000,
        tax_liability: 5000,
        cess: 200,
        rebate_87a: 0,
        final_tax: 5200,
        tax_paid: 50000,
        refund: 44800
      }
    };

    return { ...baseData, ...overrides };
  }

  // Justification: Generate edge case test data
  // Creates data for testing edge cases and boundary conditions
  // Supports various edge case scenarios
  static generateEdgeCaseData(scenario, overrides = {}) {
    const scenarios = {
      zero_income: {
        salary_income: 0,
        house_property_income: 0,
        business_profession_income: 0,
        capital_gains_income: 0,
        other_income: 0
      },
      maximum_deductions: {
        section_80c: 150000,
        section_80d: 25000,
        section_80g: 10000,
        section_80e: 200000,
        section_80tta: 10000,
        section_80ttb: 50000
      },
      high_income: {
        salary_income: 5000000,
        house_property_income: 500000,
        business_profession_income: 2000000,
        capital_gains_income: 1000000,
        other_income: 200000
      },
      nri_scenario: {
        residential_status: 'NRI',
        country_of_residence: 'United States',
        foreign_income: 100000,
        foreign_tax_paid: 20000
      }
    };

    return { ...scenarios[scenario], ...overrides };
  }
}

module.exports = TestDataGenerator;
