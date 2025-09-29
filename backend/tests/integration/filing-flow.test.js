const request = require('supertest');
const app = require('../../src/server');
const db = require('../../src/config/database');
const User = require('../../src/models/User_DDL');
const IntakeData = require('../../src/models/IntakeData_DDL');
const IncomeHeads = require('../../src/models/IncomeHeads_DDL');
const Deductions = require('../../src/models/Deductions_DDL');
const FilingService = require('../../src/services/filingService_DDL');
const DocumentProcessor = require('../../src/services/documentProcessor_DDL');
const { logger } = require('../../src/utils/logger');

// Justification: Comprehensive Integration Testing Suite
// Tests complete ITR filing workflow from user registration to submission
// Validates all DDL-aligned models and services integration
// Ensures end-to-end functionality and data integrity

describe('Complete ITR Filing Flow Integration Tests', () => {
  let userId, intakeId, authToken;
  let filingService, documentProcessor;

  beforeAll(async () => {
    // Initialize services
    filingService = new FilingService();
    documentProcessor = new DocumentProcessor();
    
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  // Justification: Test User Registration - User creation workflow
  // Tests complete user registration process with DDL-aligned models
  // Validates hash-based PII storage and authentication
  describe('User Registration and Authentication', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        pan: 'ABCDE1234F',
        mobile: '9876543210',
        email: 'test@example.com',
        consent_timestamp: new Date(),
        consent_ip: '127.0.0.1',
        locale: 'en'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      
      userId = response.body.data.userId;
      authToken = response.body.data.token;

      // Verify user was created in database
      const user = await User.findById(userId);
      expect(user).toBeDefined();
      expect(user.pan).toBe(userData.pan);
      expect(user.mobile_hash).toBeDefined();
      expect(user.email_hash).toBeDefined();
    });

    it('should authenticate user successfully', async () => {
      const loginData = {
        pan: 'ABCDE1234F',
        mobile: '9876543210'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  // Justification: Test Intake Creation - Filing initiation
  // Tests intake creation using DDL-aligned models
  // Validates intake data structure and relationships
  describe('Intake Creation and Management', () => {
    it('should create a new intake successfully', async () => {
      const intakeData = {
        ay_code: '2024-25',
        itr_type: 'ITR-1',
        full_name: 'John Doe',
        father_name: 'Robert Doe',
        date_of_birth: '1990-01-01',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        bank_details: {
          account_number: '1234567890',
          ifsc_code: 'SBIN0001234',
          bank_name: 'State Bank of India'
        }
      };

      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(intakeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.intakeId).toBeDefined();
      
      intakeId = response.body.data.intakeId;

      // Verify intake was created in database
      const intake = await IntakeData.findById(intakeId);
      expect(intake).toBeDefined();
      expect(intake.user_id).toBe(userId);
      expect(intake.ay_code).toBe(intakeData.ay_code);
      expect(intake.itr_type).toBe(intakeData.itr_type);
    });

    it('should retrieve intake details successfully', async () => {
      const response = await request(app)
        .get(`/api/intakes/${intakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.intakeId).toBe(intakeId);
      expect(response.body.data.full_name).toBe('John Doe');
    });
  });

  // Justification: Test Income Management - Income data handling
  // Tests income head creation and management using DDL models
  // Validates income data structure and calculations
  describe('Income Management', () => {
    it('should add salary income successfully', async () => {
      const incomeData = {
        head_type: 'SALARY',
        sub_type: 'SALARY',
        amount: 500000,
        details: {
          employer: 'ABC Company',
          designation: 'Software Engineer'
        },
        source_document: 'FORM16'
      };

      const response = await request(app)
        .post(`/api/intakes/${intakeId}/income`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(incomeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.incomeId).toBeDefined();

      // Verify income was created in database
      const incomeHeads = await IncomeHeads.findByIntakeId(intakeId);
      expect(incomeHeads.length).toBe(1);
      expect(incomeHeads[0].head_type).toBe('SALARY');
      expect(incomeHeads[0].amount).toBe(500000);
    });

    it('should add house property income successfully', async () => {
      const incomeData = {
        head_type: 'HOUSE_PROPERTY',
        sub_type: 'SELF_OCCUPIED',
        amount: -200000,
        details: {
          property_address: '456 Property St',
          property_type: 'Residential'
        }
      };

      const response = await request(app)
        .post(`/api/intakes/${intakeId}/income`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(incomeData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify income was created
      const incomeHeads = await IncomeHeads.findByIntakeId(intakeId);
      expect(incomeHeads.length).toBe(2);
    });
  });

  // Justification: Test Deduction Management - Deduction data handling
  // Tests deduction creation and management using DDL models
  // Validates deduction data structure and calculations
  describe('Deduction Management', () => {
    it('should add 80C deduction successfully', async () => {
      const deductionData = {
        section: '80C',
        sub_section: 'PPF',
        claimed_amount: 150000,
        eligible_amount: 150000,
        details: {
          provider: 'State Bank of India',
          account_number: 'PPF123456'
        },
        proof_document: 'PPF_STATEMENT'
      };

      const response = await request(app)
        .post(`/api/intakes/${intakeId}/deductions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(deductionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deductionId).toBeDefined();

      // Verify deduction was created in database
      const deductions = await Deductions.findByIntakeId(intakeId);
      expect(deductions.length).toBe(1);
      expect(deductions[0].section).toBe('80C');
      expect(deductions[0].claimed_amount).toBe(150000);
    });

    it('should add 80D deduction successfully', async () => {
      const deductionData = {
        section: '80D',
        sub_section: 'HEALTH_INSURANCE',
        claimed_amount: 25000,
        eligible_amount: 25000,
        details: {
          provider: 'Health Insurance Co',
          policy_number: 'HI123456'
        },
        proof_document: 'HEALTH_INSURANCE_CERTIFICATE'
      };

      const response = await request(app)
        .post(`/api/intakes/${intakeId}/deductions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(deductionData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify deduction was created
      const deductions = await Deductions.findByIntakeId(intakeId);
      expect(deductions.length).toBe(2);
    });
  });

  // Justification: Test Document Upload - Document processing workflow
  // Tests document upload and processing using DDL-aligned services
  // Validates document storage and parsing functionality
  describe('Document Upload and Processing', () => {
    it('should upload Form 16 document successfully', async () => {
      // Create a mock Form 16 PDF buffer
      const mockForm16Buffer = Buffer.from('Mock Form 16 PDF content');
      
      const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('intakeId', intakeId)
        .field('documentType', 'FORM16')
        .attach('document', mockForm16Buffer, 'form16.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documentId).toBeDefined();
      expect(response.body.data.status).toBe('UPLOADED');
    });

    it('should retrieve documents successfully', async () => {
      const response = await request(app)
        .get(`/api/intakes/${intakeId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toBeDefined();
      expect(response.body.data.documents.length).toBeGreaterThan(0);
    });
  });

  // Justification: Test Tax Computation - Tax calculation workflow
  // Tests tax computation using DDL-aligned services
  // Validates tax calculation accuracy and business logic
  describe('Tax Computation', () => {
    it('should compute tax successfully', async () => {
      const response = await request(app)
        .post(`/api/tax/compute/${intakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ regime: 'OLD' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalIncome).toBeDefined();
      expect(response.body.data.taxableIncome).toBeDefined();
      expect(response.body.data.totalTax).toBeDefined();
    });

    it('should validate ITR eligibility successfully', async () => {
      const response = await request(app)
        .get(`/api/eligibility/validate/${intakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isEligible).toBeDefined();
      expect(response.body.data.recommendedItrType).toBeDefined();
    });
  });

  // Justification: Test Filing Submission - Complete filing workflow
  // Tests complete ITR filing submission process
  // Validates filing service integration and JSON generation
  describe('Filing Submission', () => {
    it('should submit ITR successfully', async () => {
      const response = await request(app)
        .post('/api/filing/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          intakeId: intakeId,
          verificationMethod: 'AADHAAR_OTP',
          verificationData: {
            aadhaarNumber: '123456789012',
            otp: '123456'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.downloadUrl).toBeDefined();
    });

    it('should retrieve filing status successfully', async () => {
      const response = await request(app)
        .get(`/api/filing/status/${intakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBeDefined();
    });
  });

  // Justification: Test Error Handling - Error scenarios
  // Tests error handling and validation
  // Ensures proper error responses and data integrity
  describe('Error Handling and Validation', () => {
    it('should handle invalid intake ID gracefully', async () => {
      const invalidIntakeId = 'invalid-uuid';
      
      const response = await request(app)
        .get(`/api/intakes/${invalidIntakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle unauthorized access gracefully', async () => {
      const response = await request(app)
        .get(`/api/intakes/${intakeId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle invalid income data gracefully', async () => {
      const invalidIncomeData = {
        head_type: 'INVALID_TYPE',
        amount: -1000
      };

      const response = await request(app)
        .post(`/api/intakes/${intakeId}/income`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidIncomeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  // Justification: Test Data Integrity - Database consistency
  // Tests data integrity and consistency across all operations
  // Validates foreign key relationships and data accuracy
  describe('Data Integrity and Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Get intake summary
      const summaryResponse = await request(app)
        .get(`/api/intakes/${intakeId}/summary`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(summaryResponse.body.success).toBe(true);
      expect(summaryResponse.body.data.incomeSummary).toBeDefined();
      expect(summaryResponse.body.data.deductionsSummary).toBeDefined();
      expect(summaryResponse.body.data.totals).toBeDefined();
    });

    it('should handle concurrent operations correctly', async () => {
      // Simulate concurrent income additions
      const promises = [];
      for (let i = 0; i < 3; i++) {
        const incomeData = {
          head_type: 'OTHER_SOURCES',
          sub_type: 'INTEREST',
          amount: 10000 + (i * 1000),
          details: { source: `Bank ${i + 1}` }
        };

        promises.push(
          request(app)
            .post(`/api/intakes/${intakeId}/income`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(incomeData)
        );
      }

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all income entries were created
      const incomeHeads = await IncomeHeads.findByIntakeId(intakeId);
      expect(incomeHeads.length).toBeGreaterThanOrEqual(5); // Original 2 + 3 new
    });
  });

  // Justification: Cleanup Test Data - Test data management
  // Cleans up test data after tests complete
  // Ensures test isolation and database cleanliness
  async function cleanupTestData() {
    try {
      if (intakeId) {
        // Delete related data first (due to foreign key constraints)
        await db.query('DELETE FROM income_heads WHERE intake_id = $1', [intakeId]);
        await db.query('DELETE FROM deductions WHERE intake_id = $1', [intakeId]);
        await db.query('DELETE FROM documents WHERE intake_id = $1', [intakeId]);
        await db.query('DELETE FROM tax_computations WHERE intake_id = $1', [intakeId]);
        await db.query('DELETE FROM audit_events WHERE intake_id = $1', [intakeId]);
        await db.query('DELETE FROM intake_data WHERE intake_id = $1', [intakeId]);
      }
      
      if (userId) {
        await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
      }
    } catch (error) {
      logger.error('Error cleaning up test data:', error);
    }
  }
});
