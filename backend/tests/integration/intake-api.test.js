// Justification: Intake API Integration Tests - Comprehensive testing of intake API endpoints
// Tests all intake-related API endpoints including CRUD operations, validation, and error handling
// Essential for ensuring API reliability and proper data flow between frontend and backend
// Covers authentication, authorization, data validation, and business logic

const request = require('supertest');
const app = require('../../src/server');
const { testPool, cleanupTestDatabase, setupTestDatabase } = require('../config/test-database');
const TestDataGenerator = require('../utils/test-data-generator');
const { User_DDL } = require('../../src/models/User_DDL');
const { IntakeData_DDL } = require('../../src/models/IntakeData_DDL');

describe('Intake API Integration Tests', () => {
  let authToken;
  let testUser;
  let testIntake;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create test user and get auth token
    const userData = TestDataGenerator.generateUserData();
    testUser = await User_DDL.create(userData);
    
    // Generate auth token (simplified for testing)
    authToken = `Bearer test-token-${testUser.user_id}`;
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestDatabase();
  });

  describe('POST /api/intakes', () => {
    it('should create intake successfully with valid data', async () => {
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.intake_id).toBeDefined();
      expect(response.body.data.user_id).toBe(testUser.user_id);
      expect(response.body.data.ay_code).toBe(intakeData.ay_code);
      expect(response.body.data.itr_type).toBe(intakeData.itr_type);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('ay_code is required');
      expect(response.body.errors).toContain('itr_type is required');
      expect(response.body.errors).toContain('full_name is required');
    });

    it('should validate ITR type', async () => {
      const intakeData = TestDataGenerator.generateIntakeData({
        user_id: testUser.user_id,
        itr_type: 'INVALID_ITR'
      });

      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid ITR type');
    });

    it('should validate assessment year', async () => {
      const intakeData = TestDataGenerator.generateIntakeData({
        user_id: testUser.user_id,
        ay_code: 'INVALID_YEAR'
      });

      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid assessment year');
    });

    it('should require authentication', async () => {
      const intakeData = TestDataGenerator.generateITR1Data();

      const response = await request(app)
        .post('/api/intakes')
        .send(intakeData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    it('should handle duplicate intake for same user and year', async () => {
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      // Create first intake
      await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Intake already exists');
    });
  });

  describe('GET /api/intakes', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should retrieve user intakes successfully', async () => {
      const response = await request(app)
        .get('/api/intakes')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].intake_id).toBe(testIntake.intake_id);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/intakes?page=1&limit=10')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter by assessment year', async () => {
      const response = await request(app)
        .get('/api/intakes?ay_code=2024-25')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(intake => intake.ay_code === '2024-25')).toBe(true);
    });

    it('should filter by ITR type', async () => {
      const response = await request(app)
        .get('/api/intakes?itr_type=ITR-1')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(intake => intake.itr_type === 'ITR-1')).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/intakes?status=DRAFT')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(intake => intake.status === 'DRAFT')).toBe(true);
    });
  });

  describe('GET /api/intakes/:id', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should retrieve specific intake successfully', async () => {
      const response = await request(app)
        .get(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.intake_id).toBe(testIntake.intake_id);
      expect(response.body.data.user_id).toBe(testUser.user_id);
    });

    it('should return 404 for non-existent intake', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/intakes/${nonExistentId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Intake not found');
    });

    it('should not allow access to other user\'s intake', async () => {
      // Create another user
      const otherUserData = TestDataGenerator.generateUserData();
      const otherUser = await User_DDL.create(otherUserData);
      
      // Create intake for other user
      const otherIntakeData = TestDataGenerator.generateITR1Data({
        user_id: otherUser.user_id
      });
      const otherIntake = await IntakeData_DDL.create(otherIntakeData);

      const response = await request(app)
        .get(`/api/intakes/${otherIntake.intake_id}`)
        .set('Authorization', authToken)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('PUT /api/intakes/:id', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should update intake successfully', async () => {
      const updateData = {
        full_name: 'Updated Test User',
        salary_income: 600000
      };

      const response = await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.full_name).toBe(updateData.full_name);
      expect(response.body.data.salary_income).toBe(updateData.salary_income);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        salary_income: -1000 // Invalid negative income
      };

      const response = await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Income cannot be negative');
    });

    it('should not allow updating to invalid ITR type', async () => {
      const updateData = {
        itr_type: 'INVALID_ITR'
      };

      const response = await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid ITR type');
    });

    it('should handle ITR type switching', async () => {
      const updateData = {
        itr_type: 'ITR-2',
        capital_gains_income: 100000
      };

      const response = await request(app)
        .put(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.itr_type).toBe('ITR-2');
      expect(response.body.data.capital_gains_income).toBe(100000);
    });
  });

  describe('DELETE /api/intakes/:id', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should delete intake successfully', async () => {
      const response = await request(app)
        .delete(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify intake is deleted
      const getResponse = await request(app)
        .get(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .expect(404);
    });

    it('should not allow deleting other user\'s intake', async () => {
      // Create another user
      const otherUserData = TestDataGenerator.generateUserData();
      const otherUser = await User_DDL.create(otherUserData);
      
      // Create intake for other user
      const otherIntakeData = TestDataGenerator.generateITR1Data({
        user_id: otherUser.user_id
      });
      const otherIntake = await IntakeData_DDL.create(otherIntakeData);

      const response = await request(app)
        .delete(`/api/intakes/${otherIntake.intake_id}`)
        .set('Authorization', authToken)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    it('should not allow deleting filed intake', async () => {
      // Update intake status to FILED
      await IntakeData_DDL.update(testIntake.intake_id, { status: 'FILED' });

      const response = await request(app)
        .delete(`/api/intakes/${testIntake.intake_id}`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot delete filed intake');
    });
  });

  describe('POST /api/intakes/:id/validate', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should validate intake data successfully', async () => {
      const response = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.validation).toBeDefined();
      expect(response.body.data.validation.isValid).toBeDefined();
      expect(response.body.data.validation.errors).toBeInstanceOf(Array);
    });

    it('should detect missing required fields', async () => {
      // Create incomplete intake
      const incompleteData = TestDataGenerator.generateIntakeData({
        user_id: testUser.user_id,
        full_name: null, // Missing required field
        salary_income: null
      });
      const incompleteIntake = await IntakeData_DDL.create(incompleteData);

      const response = await request(app)
        .post(`/api/intakes/${incompleteIntake.intake_id}/validate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.validation.isValid).toBe(false);
      expect(response.body.data.validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/intakes/:id/compute-tax', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should compute tax successfully', async () => {
      const response = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/compute-tax`)
        .set('Authorization', authToken)
        .send({ regime: 'OLD' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.computation).toBeDefined();
      expect(response.body.data.computation.regime).toBe('OLD');
      expect(response.body.data.computation.totalIncome).toBeDefined();
      expect(response.body.data.computation.taxLiability).toBeDefined();
    });

    it('should validate regime parameter', async () => {
      const response = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/compute-tax`)
        .set('Authorization', authToken)
        .send({ regime: 'INVALID' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid tax regime');
    });

    it('should compare both regimes when requested', async () => {
      const response = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/compute-tax`)
        .set('Authorization', authToken)
        .send({ compare_regimes: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comparison).toBeDefined();
      expect(response.body.data.comparison.oldRegime).toBeDefined();
      expect(response.body.data.comparison.newRegime).toBeDefined();
      expect(response.body.data.comparison.recommendedRegime).toBeDefined();
    });
  });

  describe('POST /api/intakes/:id/generate-json', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should generate ITR JSON successfully', async () => {
      const response = await request(app)
        .post(`/api/intakes/${testIntake.intake_id}/generate-json`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.itr_json).toBeDefined();
      expect(response.body.data.itr_json.personal_info).toBeDefined();
      expect(response.body.data.itr_json.income_details).toBeDefined();
      expect(response.body.data.itr_json.tax_details).toBeDefined();
    });

    it('should validate intake completeness before generating JSON', async () => {
      // Create incomplete intake
      const incompleteData = TestDataGenerator.generateIntakeData({
        user_id: testUser.user_id,
        full_name: null // Missing required field
      });
      const incompleteIntake = await IntakeData_DDL.create(incompleteData);

      const response = await request(app)
        .post(`/api/intakes/${incompleteIntake.intake_id}/generate-json`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Intake data is incomplete');
    });
  });

  describe('GET /api/intakes/:id/audit', () => {
    beforeEach(async () => {
      // Create test intake
      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });
      testIntake = await IntakeData_DDL.create(intakeData);
    });

    it('should retrieve audit log successfully', async () => {
      const response = await request(app)
        .get(`/api/intakes/${testIntake.intake_id}/audit`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.audit_events).toBeInstanceOf(Array);
    });

    it('should support pagination for audit log', async () => {
      const response = await request(app)
        .get(`/api/intakes/${testIntake.intake_id}/audit?page=1&limit=10`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      jest.spyOn(IntakeData_DDL, 'create').mockRejectedValue(new Error('Database connection failed'));

      const intakeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id
      });

      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(intakeData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Internal server error');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle large payloads gracefully', async () => {
      const largeData = TestDataGenerator.generateITR1Data({
        user_id: testUser.user_id,
        // Add large amount of data
        large_field: 'x'.repeat(1000000)
      });

      const response = await request(app)
        .post('/api/intakes')
        .set('Authorization', authToken)
        .send(largeData)
        .expect(413);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Payload too large');
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill().map(() => {
        const intakeData = TestDataGenerator.generateITR1Data({
          user_id: testUser.user_id
        });
        return request(app)
          .post('/api/intakes')
          .set('Authorization', authToken)
          .send(intakeData);
      });

      const responses = await Promise.all(requests);
      
      // All requests should complete successfully
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .get('/api/intakes')
        .set('Authorization', authToken);
      
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
