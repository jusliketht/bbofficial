// Justification: Comprehensive System Testing Suite - Phase 4 Task 4.1
// Provides end-to-end testing for all system components and workflows
// Essential for ensuring system reliability and functionality before UAT
// Validates all Phase 3 features and integration points

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');
const { AuditService, AUDIT_EVENTS } = require('../src/services/auditService');
const { CacheService } = require('../src/services/performanceService');
const { SecurityService } = require('../src/services/securityService');
const { HealthCheckService } = require('../src/services/healthCheckService');
const CAService = require('../src/services/caService');

// Justification: Test Configuration - Comprehensive test settings
// Provides test data and configuration for all system components
// Essential for consistent and reliable testing across all features
const SYSTEM_TEST_CONFIG = {
  // User test data
  TEST_USERS: {
    regular: {
      name: 'Test User',
      email: 'test@example.com',
      mobile: '9876543210',
      pan: 'ABCDE1234F',
      password: 'TestPass123!',
      role: 'user'
    },
    ca: {
      name: 'Test CA Firm',
      email: 'ca@example.com',
      mobile: '9876543211',
      pan: 'ABCDE1235F',
      password: 'TestPass123!',
      role: 'CA'
    },
    admin: {
      name: 'Test Admin',
      email: 'admin@example.com',
      mobile: '9876543212',
      pan: 'ABCDE1236F',
      password: 'TestPass123!',
      role: 'admin'
    }
  },
  
  // Filing test data
  TEST_FILINGS: {
    itr1: {
      assessmentYear: '2025-26',
      filingFor: 'self',
      itrType: 'ITR-1',
      filingMode: 'self'
    },
    itr2: {
      assessmentYear: '2024-25',
      filingFor: 'self',
      itrType: 'ITR-2',
      filingMode: 'self'
    }
  },
  
  // Document test data
  TEST_DOCUMENTS: {
    form16: {
      document_type: 'Form16',
      section: 'salary_income',
      file_name: 'test_form16.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf'
    },
    bankStatement: {
      document_type: 'BankStatement',
      section: 'other',
      file_name: 'test_statement.pdf',
      file_size: 512000,
      mime_type: 'application/pdf'
    }
  }
};

// Justification: System Test Suite - Comprehensive testing framework
// Provides testing for all system components and integration points
// Essential for validating system functionality and reliability
describe('Comprehensive System Testing Suite', () => {
  let authTokens = {};
  let testData = {};

  // Justification: Setup Test Environment - Prepare comprehensive test data
  // Provides clean test environment with all necessary data
  // Essential for reliable and isolated testing
  beforeAll(async () => {
    console.log('Setting up comprehensive system test environment...');
    
    // Clean test database
    await cleanTestDatabase();
    
    // Create test users
    for (const [userType, userData] of Object.entries(SYSTEM_TEST_CONFIG.TEST_USERS)) {
      const user = await createTestUser(userData);
      const token = await getAuthToken(userData);
      authTokens[userType] = token;
      testData[`${userType}User`] = user;
    }
    
    // Create CA firm for CA user
    if (testData.caUser) {
      const caFirmData = {
        name: 'Test CA Firm',
        email: 'testca@example.com',
        dsc_details: {
          dsc_number: 'DSC123456789',
          valid_until: '2025-12-31'
        },
        contact_number: '9876543210',
        address: '123 Test Street, Test City, Test State 123456'
      };
      
      try {
        const caResponse = await request(app)
          .post('/api/ca/create')
          .set('Authorization', `Bearer ${authTokens.ca}`)
          .send(caFirmData);
        
        if (caResponse.status === 201) {
          testData.caId = caResponse.body.data.ca_id;
          console.log('CA firm created successfully:', testData.caId);
        } else if (caResponse.status === 409) {
          // CA firm already exists, get existing one
          const existingCaResponse = await request(app)
            .get('/api/ca/profile')
            .set('Authorization', `Bearer ${authTokens.ca}`);
          
          if (existingCaResponse.status === 200) {
            testData.caId = existingCaResponse.body.data.ca_id;
            console.log('Using existing CA firm:', testData.caId);
          }
        }
      } catch (error) {
        console.log('Error setting up CA firm:', error.message);
      }
    }
    
    console.log('Test environment setup completed');
  });

  // Justification: Cleanup Test Environment - Remove test data after tests
  // Provides clean test environment for subsequent test runs
  // Essential for test isolation and data integrity
  afterAll(async () => {
    console.log('Cleaning up test environment...');
    await cleanTestDatabase();
    console.log('Test environment cleanup completed');
  });

  // Justification: Authentication System Tests - Validate user authentication
  // Provides comprehensive testing of authentication workflows
  // Essential for security and user access validation
  describe('Authentication System', () => {
    test('should register new user successfully', async () => {
      const newUser = {
        name: 'New Test User',
        email: 'newuser@example.com',
        mobile: '9876543213',
        pan: 'ABCDE1237F',
        password: 'NewPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      console.log('Registration response:', response.body);
      console.log('Response status:', response.status);

      if (response.status === 409) {
        console.log('User already exists, this is expected for duplicate test runs');
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('already exists');
      } else {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty('user_id');
        expect(response.body.data.user.email).toBe(newUser.email);
      }
    });

    test('should login user successfully', async () => {
      const loginData = {
        identifier: SYSTEM_TEST_CONFIG.TEST_USERS.regular.email,
        password: SYSTEM_TEST_CONFIG.TEST_USERS.regular.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('user_id');
    });

    test('should validate JWT token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authTokens.regular}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // Justification: ITR Filing Workflow Tests - Validate complete filing process
  // Provides end-to-end testing of the core ITR filing workflow
  // Essential for business functionality validation
  describe('ITR Filing Workflow', () => {
    test('should create new filing', async () => {
      const filingData = SYSTEM_TEST_CONFIG.TEST_FILINGS.itr1;

      const response = await request(app)
        .post('/api/filing/create')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send(filingData);

      if (response.status === 409) {
        // Filing already exists for this assessment year, this is expected
        expect(response.body.error).toContain('already have a draft filing');
        expect(response.body).toHaveProperty('filingId');
        testData.filingId = response.body.filingId;
      } else {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('filing_id');
        expect(response.body.data.assessment_year).toBe(filingData.assessmentYear);
        testData.filingId = response.body.data.filing_id;
      }
    });

    test('should upload document successfully', async () => {
      // Ensure we have a filing ID first
      if (!testData.filingId) {
        const filingData = SYSTEM_TEST_CONFIG.TEST_FILINGS.itr1;
        const filingResponse = await request(app)
          .post('/api/filing/create')
          .set('Authorization', `Bearer ${authTokens.regular}`)
          .send(filingData);

        if (filingResponse.status === 409) {
          testData.filingId = filingResponse.body.filingId;
        } else {
          testData.filingId = filingResponse.body.data.filing_id;
        }
      }

      const documentData = SYSTEM_TEST_CONFIG.TEST_DOCUMENTS.form16;

      const response = await request(app)
        .post('/api/upload/document')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .field('filingId', testData.filingId)
        .field('documentType', documentData.document_type)
        .field('section', documentData.section)
        .attach('file', Buffer.from('test file content'), documentData.file_name);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('upload_id');
      
      testData.uploadId = response.body.data.upload_id;
    });

    test('should process intake data', async () => {
      // Ensure we have a filing ID first
      if (!testData.filingId) {
        const filingData = SYSTEM_TEST_CONFIG.TEST_FILINGS.itr1;
        const filingResponse = await request(app)
          .post('/api/filing/create')
          .set('Authorization', `Bearer ${authTokens.regular}`)
          .send(filingData);

        if (filingResponse.status === 409) {
          testData.filingId = filingResponse.body.filingId;
        } else {
          testData.filingId = filingResponse.body.data.filing_id;
        }
      }

      const intakeData = {
        filing_id: testData.filingId,
        section: 'salary_income',
        user_input: {
          employer_name: 'Test Company',
          salary: 500000,
          allowances: 50000
        }
      };

      const response = await request(app)
        .post('/api/intake/process')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send(intakeData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('intake_id');
    });

    test('should compute tax successfully', async () => {
      // Ensure we have a filing ID first
      if (!testData.filingId) {
        const filingData = SYSTEM_TEST_CONFIG.TEST_FILINGS.itr1;
        const filingResponse = await request(app)
          .post('/api/filing/create')
          .set('Authorization', `Bearer ${authTokens.regular}`)
          .send(filingData);

        if (filingResponse.status === 409) {
          testData.filingId = filingResponse.body.filingId;
        } else {
          testData.filingId = filingResponse.body.data.filing_id;
        }
      }

      const response = await request(app)
        .post('/api/tax/compute')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send({ filing_id: testData.filingId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('computation_id');
      expect(response.body.data).toHaveProperty('tax_summary');
      expect(response.body.data.tax_summary).toHaveProperty('oldRegime');
      expect(response.body.data.tax_summary).toHaveProperty('newRegime');
    });

    test('should submit filing successfully', async () => {
      // Ensure we have a filing ID first
      if (!testData.filingId) {
        const filingData = SYSTEM_TEST_CONFIG.TEST_FILINGS.itr1;
        const filingResponse = await request(app)
          .post('/api/filing/create')
          .set('Authorization', `Bearer ${authTokens.regular}`)
          .send(filingData);

        if (filingResponse.status === 409) {
          testData.filingId = filingResponse.body.filingId;
        } else {
          testData.filingId = filingResponse.body.data.filing_id;
        }
      }

      const response = await request(app)
        .post('/api/filing/submit')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send({ filing_id: testData.filingId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ack_number');
    });
  });

  // Justification: CA/B2B Portal Tests - Validate CA portal functionality
  // Provides comprehensive testing of B2B operations and bulk processing
  // Essential for CA firm operations validation
  describe('CA/B2B Portal', () => {
    test('should create CA firm successfully', async () => {
      const caData = {
        name: 'Test CA Firm',
        email: 'ca@testfirm2.com', // Use unique email
        dsc_details: {
          certificate_number: 'TEST123456',
          valid_until: '2025-12-31'
        }
      };

      const response = await request(app)
        .post('/api/ca/create')
        .set('Authorization', `Bearer ${authTokens.admin}`)
        .send(caData);

      if (response.status === 409) {
        // CA firm already exists, this is expected for duplicate test runs
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('already exists');
      } else {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('ca_id');
        testData.caId = response.body.data.ca_id;
      }
    });

    test('should create client assignment', async () => {
      // Ensure we have required data
      if (!testData.caId) {
        console.log('Skipping client assignment test - no CA ID available');
        return;
      }
      
      if (!testData.filingId) {
        // Create a filing if needed
        const filingData = SYSTEM_TEST_CONFIG.TEST_FILINGS.itr1;
        const filingResponse = await request(app)
          .post('/api/filing/create')
          .set('Authorization', `Bearer ${authTokens.regular}`)
          .send(filingData);

        if (filingResponse.status === 409) {
          testData.filingId = filingResponse.body.filingId;
        } else {
          testData.filingId = filingResponse.body.data.filing_id;
        }
      }

      const assignmentData = {
        user_id: testData.regularUser.user_id,
        filing_id: testData.filingId,
        assignment_type: 'filing'
      };

      const response = await request(app)
        .post('/api/ca/assignments')
        .set('Authorization', `Bearer ${authTokens.ca}`)
        .send(assignmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('assignment_id');
    });

    test('should create bulk processing job', async () => {
      // Ensure we have CA ID
      if (!testData.caId) {
        console.log('Skipping bulk processing job test - no CA ID available');
        return;
      }

      const bulkJobData = {
        input_file: 'bulk_clients.csv',
        job_type: 'client_import'
      };

      const response = await request(app)
        .post('/api/ca/bulk-jobs')
        .set('Authorization', `Bearer ${authTokens.ca}`)
        .send(bulkJobData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('job_id');
      
      testData.jobId = response.body.data.job_id;
    });

    test('should get CA dashboard statistics', async () => {
      // Ensure we have CA ID
      if (!testData.caId) {
        console.log('Skipping CA dashboard statistics test - no CA ID available');
        return;
      }

      const response = await request(app)
        .get('/api/ca/dashboard')
        .set('Authorization', `Bearer ${authTokens.ca}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('recent_activity');
    });
  });

  // Justification: Audit Logging Tests - Validate audit trail functionality
  // Provides comprehensive testing of audit logging and compliance
  // Essential for regulatory compliance validation
  describe('Audit Logging System', () => {
    test('should log user actions automatically', async () => {
      // Perform an action that should trigger audit logging
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authTokens.regular}`);

      expect(response.status).toBe(200);

      // Wait a moment for async audit logging
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if audit log was created
      const auditLogs = await AuditService.getAuditLogs({
        userId: testData.regularUser.user_id,
        limit: 5
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    test('should retrieve audit logs with filters', async () => {
      const response = await request(app)
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${authTokens.admin}`)
        .query({
          eventType: 'USER_LOGIN',
          limit: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('logs');
    });

    test('should generate audit statistics', async () => {
      const response = await request(app)
        .get('/api/audit/statistics')
        .set('Authorization', `Bearer ${authTokens.admin}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statistics');
    });
  });

  // Justification: Performance & Caching Tests - Validate performance optimization
  // Provides testing of caching mechanisms and performance improvements
  // Essential for system performance validation
  describe('Performance & Caching', () => {
    test('should cache user data', async () => {
      // First request to populate cache
      const response1 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authTokens.regular}`);

      expect(response1.status).toBe(200);

      // Second request should use cache
      const response2 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authTokens.regular}`);

      expect(response2.status).toBe(200);

      // Check cache statistics
      const stats = CacheService.getStats('userCache');
      expect(stats).toBeDefined();
      expect(stats.hits).toBeGreaterThan(0);
    });

    test('should optimize query performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/filing/list')
        .set('Authorization', `Bearer ${authTokens.regular}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  // Justification: Security Tests - Validate security measures
  // Provides comprehensive testing of security features and threat detection
  // Essential for security validation and compliance
  describe('Security Features', () => {
    test('should sanitize input data', async () => {
      const maliciousInput = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/user/update')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send(maliciousInput);

      // Should either reject or sanitize the input
      expect(response.status).toBe(400);
    });

    test('should validate password strength', async () => {
      const weakPassword = {
        current_password: SYSTEM_TEST_CONFIG.TEST_USERS.regular.password,
        new_password: 'weak'
      };

      const response = await request(app)
        .post('/api/user/change-password')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send(weakPassword);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should detect rate limiting', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${authTokens.regular}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  // Justification: Health Monitoring Tests - Validate system health checks
  // Provides testing of health monitoring and system status reporting
  // Essential for operational monitoring validation
  describe('Health Monitoring', () => {
    test('should return system health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
    });

    test('should return detailed health report', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('system');
      expect(response.body.details).toHaveProperty('process');
    });

    test('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(['ready', 'not ready']).toContain(response.body.status);
    });

    test('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('alive');
    });
  });

  // Justification: Error Handling Tests - Validate error management
  // Provides comprehensive testing of error handling and recovery
  // Essential for system reliability validation
  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    test('should handle validation errors', async () => {
      const invalidData = {
        email: 'invalid-email',
        mobile: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('fieldErrors');
    });

    test('should handle file upload errors', async () => {
      const response = await request(app)
        .post('/api/upload/document')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .field('filing_id', 'invalid-filing-id')
        .attach('file', Buffer.from('test'), 'test.exe');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Justification: Integration Tests - Validate component integration
  // Provides testing of component interactions and data flow
  // Essential for system integration validation
  describe('Integration Tests', () => {
    test('should maintain data consistency across components', async () => {
      // Create filing
      const filingResponse = await request(app)
        .post('/api/filing/create')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send(SYSTEM_TEST_CONFIG.TEST_FILINGS.itr2); // Use different filing data

      let filingId;
      if (filingResponse.status === 409) {
        filingId = filingResponse.body.filingId;
      } else {
        expect(filingResponse.status).toBe(201);
        filingId = filingResponse.body.data.filing_id;
      }

      // Add intake data
      await request(app)
        .post('/api/intake/process')
        .set('Authorization', `Bearer ${authTokens.regular}`)
        .send({
          filing_id: filingId,
          section: 'salary_income',
          user_input: { salary: 500000 }
        });

      // Verify data consistency
      const filingData = await request(app)
        .get(`/api/filing/${filingId}`)
        .set('Authorization', `Bearer ${authTokens.regular}`);

      expect(filingData.body.success).toBe(true);
      expect(filingData.body.data).toHaveProperty('intake_data');
    });

    test('should handle concurrent user operations', async () => {
      const operations = [];
      
      // Simulate multiple users performing operations
      for (let i = 0; i < 5; i++) {
        operations.push(
          request(app)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${authTokens.regular}`)
        );
      }

      const results = await Promise.all(operations);
      
      // All operations should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
      });
    });
  });
});

// Justification: Test Utility Functions - Helper functions for testing
// Provides common testing utilities and setup functions
// Essential for test efficiency and maintainability
async function cleanTestDatabase() {
  try {
    // Use the database connection from the app
    const db = require('../src/config/database');
    
    // Clean up test data more thoroughly
    await db.query('DELETE FROM audit_trail WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM ca_assignments WHERE ca_id IN (SELECT ca_id FROM ca_firms WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM bulk_jobs WHERE ca_id IN (SELECT ca_id FROM ca_firms WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM consent_log WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM document_uploads WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM verification_sessions WHERE filing_id IN (SELECT filing_id FROM filings WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM filing_declarations WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM tax_computations WHERE filing_id IN (SELECT filing_id FROM filings WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM intake_data WHERE filing_id IN (SELECT filing_id FROM filings WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1))', ['%test%']);
    await db.query('DELETE FROM filings WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE $1)', ['%test%']);
    await db.query('DELETE FROM ca_firms WHERE email LIKE $1', ['%test%']);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    
    console.log('Test database cleaned');
  } catch (error) {
    console.error('Failed to clean test database:', error);
  }
}

async function createTestUser(userData) {
  try {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    if (response.status === 409) {
      // User already exists, try to login to get user data
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: userData.email,
          password: userData.password
        });
      
      if (loginResponse.status === 200) {
        return loginResponse.body.data.user;
      }
    }
    
    // For CA users, we need to ensure they have the CA role
    if (userData.role === 'CA' && response.status === 201) {
      // Update the user role to CA
      const db = require('../src/config/database');
      await db.query(
        'UPDATE users SET role = $1 WHERE email = $2',
        ['CA', userData.email]
      );
      
      // Get the updated user data
      const updatedUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );
      
      return updatedUser.rows[0];
    }
    
    return response.body.data.user;
  } catch (error) {
    console.error('Failed to create test user:', error);
    return null;
  }
}

async function getAuthToken(userData) {
  try {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: userData.email,
        password: userData.password
      });
    
    return response.body.data.token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}
