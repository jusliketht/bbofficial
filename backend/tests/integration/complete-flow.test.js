// Justification: Complete Flow Integration Test - End-to-end testing of entire ITR filing process
// Tests the complete user journey from registration to ITR filing completion
// Essential for ensuring all components work together seamlessly
// Covers frontend-backend integration, data flow, and business logic

const request = require('supertest');
const app = require('../../src/server');
const { testPool, cleanupTestDatabase, setupTestDatabase } = require('../config/test-database');
const TestDataGenerator = require('../utils/test-data-generator');
const { User_DDL } = require('../../src/models/User_DDL');
const { IntakeData_DDL } = require('../../src/models/IntakeData_DDL');
const { PersonalInfo_DDL } = require('../../src/models/PersonalInfo_DDL');
const { BankAccounts_DDL } = require('../../src/models/BankAccounts_DDL');
const { TaxPayments_DDL } = require('../../src/models/TaxPayments_DDL');

describe('Complete ITR Filing Flow Integration Tests', () => {
  let authToken;
  let testUser;
  let testIntake;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create test user
    const userData = TestDataGenerator.generateUserData();
    testUser = await User_DDL.create(userData);
    authToken = `Bearer test-token-${testUser.user_id}`;
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Complete ITR-1 Filing Flow', () => {
    it('should complete full ITR-1 filing process successfully', async () => {
      // Step 1: Create intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      testIntake = createResponse.body.data;

      // Step 2: Add personal information
      const personalInfoData = TestDataGenerator.generatePersonalInfoData(testIntake.intake_id);
      
      const personalInfoResponse = await request(app)
        .post('/api/personal-info')
        .set('Authorization', authToken)
        .send(personalInfoData)
        .expect(201);

      expect(personalInfoResponse.body.success).toBe(true);

      // Step 3: Add bank account details
      const bankAccountData = TestDataGenerator.generateBankAccountData(testIntake.intake_id);
      
      const bankAccountResponse = await request(app)
        .post('/api/bank-details')
        .set('Authorization', authToken)
        .send(bankAccountData)
        .expect(201);

      expect(bankAccountResponse.body.success).toBe(true);

      // Step 4: Add tax payment details
      const taxPaymentData = TestDataGenerator.generateTaxPaymentData(testIntake.intake_id);
      
      const taxPaymentResponse = await request(app)
        .post('/api/tax-details')
        .set('Authorization', authToken)
        .send(taxPaymentData)
        .expect(201);

      expect(taxPaymentResponse.body.success).toBe(true);

      // Step 5: Validate intake data
      const validateResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(validateResponse.body.success).toBe(true);
      expect(validateResponse.body.data.validation.isValid).toBe(true);

      // Step 6: Compute tax
      const computeTaxResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/compute-tax`)
        .set('Authorization', authToken)
        .send({ regime: 'OLD' })
        .expect(200);

      expect(computeTaxResponse.body.success).toBe(true);
      expect(computeTaxResponse.body.data.computation).toBeDefined();

      // Step 7: Generate ITR JSON
      const generateJSONResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/generate-json`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateJSONResponse.body.success).toBe(true);
      expect(generateJSONResponse.body.data.itr_json).toBeDefined();

      // Step 8: Submit for filing
      const submitResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/submit`)
        .set('Authorization', authToken)
        .send({
          verification_method: 'AADHAAR_OTP',
          verification_date: new Date().toISOString()
        })
        .expect(200);

      expect(submitResponse.body.success).toBe(true);
      expect(submitResponse.body.data.status).toBe('FILED');
    });

    it('should handle ITR type switching from ITR-1 to ITR-2', async () => {
      // Step 1: Create ITR-1 intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Add capital gains (triggers ITR-2 requirement)
      const updateResponse = await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send({
          capital_gains_income: 100000,
          itr_type: 'ITR-2'
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.itr_type).toBe('ITR-2');

      // Step 3: Add ITR-2 specific data
      const capitalGainsData = TestDataGenerator.generateCapitalGainsData(testIntake.intake_id);
      
      const capitalGainsResponse = await request(app)
        .post('/api/itr2/capital-gains')
        .set('Authorization', authToken)
        .send(capitalGainsData)
        .expect(201);

      expect(capitalGainsResponse.body.success).toBe(true);

      // Step 4: Validate ITR-2 data
      const validateResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(validateResponse.body.success).toBe(true);
    });

    it('should handle document upload and parsing', async () => {
      // Step 1: Create intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Upload Form 16 document
      const form16Data = TestDataGenerator.generateDocumentData(testIntake.intake_id, {
        document_type: 'FORM_16',
        file_name: 'form16_2024.pdf'
      });

      const uploadResponse = await request(app)
        .post('/api/upload/documents')
        .set('Authorization', authToken)
        .send(form16Data)
        .expect(201);

      expect(uploadResponse.body.success).toBe(true);

      // Step 3: Parse document data
      const parseResponse = await request(app)
        .post(`/api/upload/documents/${uploadResponse.body.data.document_id}/parse`)
        .set('Authorization', authToken)
        .expect(200);

      expect(parseResponse.body.success).toBe(true);
      expect(parseResponse.body.data.parsed_data).toBeDefined();

      // Step 4: Apply parsed data to intake
      const applyDataResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/apply-document-data`)
        .set('Authorization', authToken)
        .send({
          document_id: uploadResponse.body.data.document_id
        })
        .expect(200);

      expect(applyDataResponse.body.success).toBe(true);
    });

    it('should handle tax computation comparison', async () => {
      // Step 1: Create intake with high income
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id,
        salary_income: 1500000,
        standard_deduction: 50000,
        section_80c: 150000,
        section_80d: 25000
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Compare tax regimes
      const compareResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/compute-tax`)
        .set('Authorization', authToken)
        .send({ compare_regimes: true })
        .expect(200);

      expect(compareResponse.body.success).toBe(true);
      expect(compareResponse.body.data.comparison).toBeDefined();
      expect(compareResponse.body.data.comparison.oldRegime).toBeDefined();
      expect(compareResponse.body.data.comparison.newRegime).toBeDefined();
      expect(compareResponse.body.data.comparison.recommendedRegime).toBeDefined();
    });

    it('should handle audit trail throughout the process', async () => {
      // Step 1: Create intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Perform multiple operations
      await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send({ salary_income: 600000 })
        .expect(200);

      await request(app)
        .post('/api/personal-info')
        .set('Authorization', authToken)
        .send(TestDataGenerator.generatePersonalInfoData(testIntake.intake_id))
        .expect(201);

      // Step 3: Check audit trail
      const auditResponse = await request(app)
        .get(`/api/intakes/${testIntake.intake_id}/audit`)
        .set('Authorization', authToken)
        .expect(200);

      expect(auditResponse.body.success).toBe(true);
      expect(auditResponse.body.data.audit_events.length).toBeGreaterThan(0);
    });
  });

  describe('Complete ITR-2 Filing Flow', () => {
    it('should complete full ITR-2 filing process with multiple properties and capital gains', async () => {
      // Step 1: Create ITR-2 intake
      const intakeData = TestDataGenerator.generateITR2Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Add house properties
      const houseProperty1 = TestDataGenerator.generateHousePropertyData(testIntake.intake_id, {
        property_type: 'let_out',
        annual_value: 120000
      });

      const houseProperty2 = TestDataGenerator.generateHousePropertyData(testIntake.intake_id, {
        property_type: 'self_occupied',
        annual_value: 0
      });

      await request(app)
        .post('/api/itr2/house-properties')
        .set('Authorization', authToken)
        .send(houseProperty1)
        .expect(201);

      await request(app)
        .post('/api/itr2/house-properties')
        .set('Authorization', authToken)
        .send(houseProperty2)
        .expect(201);

      // Step 3: Add capital gains
      const capitalGainsData = TestDataGenerator.generateCapitalGainsData(testIntake.intake_id);

      await request(app)
        .post('/api/itr2/capital-gains')
        .set('Authorization', authToken)
        .send(capitalGainsData)
        .expect(201);

      // Step 4: Add foreign income (if applicable)
      const foreignIncomeData = TestDataGenerator.generateForeignIncomeData(testIntake.intake_id);

      await request(app)
        .post('/api/itr2/foreign-income')
        .set('Authorization', authToken)
        .send(foreignIncomeData)
        .expect(201);

      // Step 5: Complete the filing process
      const validateResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(validateResponse.body.success).toBe(true);

      const generateJSONResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/generate-json`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateJSONResponse.body.success).toBe(true);
      expect(generateJSONResponse.body.data.itr_json).toBeDefined();
    });
  });

  describe('Complete ITR-3 Filing Flow', () => {
    it('should complete full ITR-3 filing process with business income', async () => {
      // Step 1: Create ITR-3 intake
      const intakeData = TestDataGenerator.generateITR3Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Add business profession details
      const businessData = TestDataGenerator.generateBusinessProfessionData(testIntake.intake_id);

      await request(app)
        .post('/api/itr3/business-profession')
        .set('Authorization', authToken)
        .send(businessData)
        .expect(201);

      // Step 3: Complete the filing process
      const validateResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(validateResponse.body.success).toBe(true);

      const generateJSONResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/generate-json`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateJSONResponse.body.success).toBe(true);
    });
  });

  describe('Complete ITR-4 Filing Flow', () => {
    it('should complete full ITR-4 filing process with presumptive business', async () => {
      // Step 1: Create ITR-4 intake
      const intakeData = TestDataGenerator.generateITR4Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Add presumptive business details
      const presumptiveData = TestDataGenerator.generatePresumptiveBusinessData(testIntake.intake_id);

      await request(app)
        .post('/api/itr4/presumptive-business')
        .set('Authorization', authToken)
        .send(presumptiveData)
        .expect(201);

      // Step 3: Complete the filing process
      const validateResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(validateResponse.body.success).toBe(true);

      const generateJSONResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/generate-json`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateJSONResponse.body.success).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle incomplete data gracefully', async () => {
      // Step 1: Create intake with minimal data
      const intakeData = TestDataGenerator.generateIntakeData({
        user_id: testUser.user_id,
        full_name: 'Test User',
        salary_income: 500000
        // Missing other required fields
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Try to validate incomplete data
      const validateResponse = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(validateResponse.body.success).toBe(true);
      expect(validateResponse.body.data.validation.isValid).toBe(false);
      expect(validateResponse.body.data.validation.errors.length).toBeGreaterThan(0);
    });

    it('should handle concurrent operations', async () => {
      // Step 1: Create intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Perform concurrent operations
      const operations = [
        request(app)
          .put(`/api/intakes/${testIntake.intake_id}`)
          .set('Authorization', authToken)
          .send({ salary_income: 600000 }),
        request(app)
          .post('/api/personal-info')
          .set('Authorization', authToken)
          .send(TestDataGenerator.generatePersonalInfoData(testIntake.intake_id)),
        request(app)
          .post('/api/bank-details')
          .set('Authorization', authToken)
          .send(TestDataGenerator.generateBankAccountData(testIntake.intake_id))
      ];

      const responses = await Promise.all(operations);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should handle data validation errors', async () => {
      // Step 1: Create intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Try to update with invalid data
      const invalidUpdateResponse = await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send({
          salary_income: -1000, // Invalid negative income
          itr_type: 'INVALID_ITR' // Invalid ITR type
        })
        .expect(400);

      expect(invalidUpdateResponse.body.success).toBe(false);
      expect(invalidUpdateResponse.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple intakes efficiently', async () => {
      const intakes = [];
      const startTime = Date.now();

      // Create multiple intakes
      for (let i = 0; i < 10; i++) {
        const intakeData = TestDataGenerator.generateITR1Data({
          user_id: testUser.user_id,
          full_name: `Test User ${i}`
        });

        const response = await request(app)
          .post('/api/intakes')
          .set('Authorization', authToken)
          .send(intakeData)
          .expect(201);

        intakes.push(response.body.data);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(intakes.length).toBe(10);
    });

    it('should handle large data sets efficiently', async () => {
      // Step 1: Create intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const createResponse = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      testIntake = createResponse.body.data;

      // Step 2: Add large amount of income heads
      const startTime = Date.now();
      const incomeHeads = [];

      for (let i = 0; i < 100; i++) {
        const incomeHeadData = TestDataGenerator.generateIncomeHeadData(testIntake.intake_id, {
          head_type: 'OTHER_SOURCES',
          sub_type: `Other Income ${i}`,
          amount: 1000 + i
        });

        const response = await request(app)
          .post('/api/income-heads')
          .set('Authorization', authToken)
          .send(incomeHeadData)
          .expect(201);

        incomeHeads.push(response.body.data);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(incomeHeads.length).toBe(100);
    });
  });
});
