// Justification: Integration Test Suite - Comprehensive testing for Phase 3 features
// Provides automated testing for all integrated components
// Essential for ensuring system reliability and functionality
// Supports continuous integration and quality assurance

const request = require('supertest');
const app = require('../src/server');
const db = require('../src/config/database');
const { AuditService, AUDIT_EVENTS } = require('../src/services/auditService');
const { CacheService } = require('../src/services/performanceService');
const { SecurityService } = require('../src/services/securityService');

// Justification: Test Configuration - Centralized test settings
// Provides configurable test parameters for different environments
// Essential for test consistency and environment management
const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TEST_USER: {
    name: 'Test User',
    email: 'test@example.com',
    mobile: '9876543210',
    pan: 'ABCDE1234F',
    password: 'TestPass123!'
  },
  TEST_CA: {
    name: 'Test CA Firm',
    email: 'ca@example.com',
    mobile: '9876543211',
    pan: 'ABCDE1235F',
    password: 'TestPass123!',
    role: 'CA'
  },
  TEST_ADMIN: {
    name: 'Test Admin',
    email: 'admin@example.com',
    mobile: '9876543212',
    pan: 'ABCDE1236F',
    password: 'TestPass123!',
    role: 'admin'
  }
};

// Justification: Test Utilities - Helper functions for testing
// Provides common testing utilities and setup functions
// Essential for test efficiency and maintainability
class TestUtils {
  
  // Justification: Setup Test Database - Prepare test environment
  // Provides clean test database state for each test
  // Essential for test isolation and reliability
  static async setupTestDatabase() {
    try {
      // Clear test data
      await db.query('DELETE FROM audit_trail WHERE user_id LIKE $1', ['test%']);
      await db.query('DELETE FROM ca_assignments WHERE ca_id LIKE $1', ['test%']);
      await db.query('DELETE FROM bulk_jobs WHERE ca_id LIKE $1', ['test%']);
      await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
      
      console.log('Test database cleaned');
    } catch (error) {
      console.error('Failed to setup test database:', error);
    }
  }

  // Justification: Create Test User - Generate test user data
  // Provides consistent test user creation for testing
  // Essential for user-related test scenarios
  static async createTestUser(userData = TEST_CONFIG.TEST_USER) {
    try {
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      return response.body.data;
    } catch (error) {
      console.error('Failed to create test user:', error);
      return null;
    }
  }

  // Justification: Get Auth Token - Obtain authentication token
  // Provides authentication for protected route testing
  // Essential for testing authenticated endpoints
  static async getAuthToken(userData = TEST_CONFIG.TEST_USER) {
    try {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });
      
      return response.body.data.token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Justification: Cleanup Test Data - Remove test data after tests
  // Provides test data cleanup for environment maintenance
  // Essential for test environment hygiene
  static async cleanupTestData() {
    try {
      await db.query('DELETE FROM audit_trail WHERE user_id LIKE $1', ['test%']);
      await db.query('DELETE FROM ca_assignments WHERE ca_id LIKE $1', ['test%']);
      await db.query('DELETE FROM bulk_jobs WHERE ca_id LIKE $1', ['test%']);
      await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
      
      console.log('Test data cleaned up');
    } catch (error) {
      console.error('Failed to cleanup test data:', error);
    }
  }
}

// Justification: Integration Test Suite - Comprehensive integration tests
// Provides end-to-end testing for all system components
// Essential for ensuring system integration and functionality
describe('ITR Filing Platform Integration Tests', () => {
  
  beforeAll(async () => {
    await TestUtils.setupTestDatabase();
  });

  afterAll(async () => {
    await TestUtils.cleanupTestData();
  });

  // Justification: Authentication Tests - Test user authentication flows
  // Provides validation of user registration and login functionality
  // Essential for user access control and security
  describe('Authentication System', () => {
    let testUser;

    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration.test@example.com',
        mobile: '9876543220',
        pan: 'ABCDE1240F',
        password: 'IntegrationPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      if (response.status === 409) {
        // User already exists, this is expected for duplicate test runs
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('already exists');
        testUser = userData; // Use the existing user data
      } else {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toHaveProperty('user_id');
        expect(response.body.data.user.email).toBe(userData.email);
        testUser = userData; // Store the user data for login test
      }
    });

    test('should login user successfully', async () => {
      // Ensure we have user data from registration test
      if (!testUser) {
        // If registration test didn't run or failed, create user data
        testUser = {
          name: 'Integration Test User',
          email: 'integration.test@example.com',
          mobile: '9876543220',
          pan: 'ABCDE1240F',
          password: 'IntegrationPass123!'
        };
      }

      const loginData = {
        identifier: testUser.email,
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('user_id');
    });

    test('should validate password strength', async () => {
      const weakPassword = '123';
      const validation = SecurityService.validatePassword(weakPassword);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  // Justification: CA Portal Tests - Test CA/B2B functionality
  // Provides validation of CA portal features and bulk processing
  // Essential for B2B operations and professional services
  describe('CA Portal System', () => {
    let caToken;
    let caUser;

    beforeAll(async () => {
      // Create CA user
      caUser = await TestUtils.createTestUser(TEST_CONFIG.TEST_CA);
      caToken = await TestUtils.getAuthToken(TEST_CONFIG.TEST_CA);
    });

    test('should create CA firm profile', async () => {
      const caFirmData = {
        firm_name: 'Test CA Firm',
        registration_number: 'CA123456',
        address: '123 Test Street, Test City',
        contact_person: 'Test Contact',
        phone: '9876543210',
        email: 'firm@testca.com'
      };

      const response = await request(app)
        .post('/api/ca/profile')
        .set('Authorization', `Bearer ${caToken}`)
        .send(caFirmData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ca_id');
    });

    test('should create bulk job successfully', async () => {
      const bulkJobData = {
        job_name: 'Test Bulk Job',
        description: 'Test bulk processing job',
        expected_records: 100,
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/ca/bulk-jobs')
        .set('Authorization', `Bearer ${caToken}`)
        .send(bulkJobData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('job_id');
      expect(response.body.data.status).toBe('pending');
    });

    test('should list CA assignments', async () => {
      const response = await request(app)
        .get('/api/ca/assignments')
        .set('Authorization', `Bearer ${caToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get CA dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/ca/dashboard')
        .set('Authorization', `Bearer ${caToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_assignments');
      expect(response.body.data).toHaveProperty('pending_assignments');
      expect(response.body.data).toHaveProperty('completed_assignments');
    });
  });

  // Justification: Audit System Tests - Test audit logging functionality
  // Provides validation of audit trail and compliance features
  // Essential for regulatory compliance and security monitoring
  describe('Audit System', () => {
    let adminToken;

    beforeAll(async () => {
      adminToken = await TestUtils.getAuthToken(TEST_CONFIG.TEST_ADMIN);
    });

    test('should log user actions automatically', async () => {
      // Perform an action that should be logged
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Check if audit log was created
      const auditLogs = await AuditService.getAuditLogs({
        userId: 'test',
        limit: 1
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    test('should retrieve audit logs with filters', async () => {
      const response = await request(app)
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          limit: 10,
          offset: 0,
          eventType: 'USER_LOGIN'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get audit statistics', async () => {
      const response = await request(app)
        .get('/api/audit/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should export audit logs', async () => {
      const response = await request(app)
        .post('/api/audit/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          format: 'json',
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // Justification: Performance Tests - Test caching and optimization
  // Provides validation of performance optimization features
  // Essential for system scalability and user experience
  describe('Performance System', () => {
    test('should cache data successfully', async () => {
      const testData = { test: 'data' };
      const cacheKey = 'test:key';
      
      // Set cache
      const setResult = CacheService.set('userCache', cacheKey, testData);
      expect(setResult).toBe(true);
      
      // Get cache
      const cachedData = CacheService.get('userCache', cacheKey);
      expect(cachedData).toEqual(testData);
    });

    test('should handle cache misses gracefully', async () => {
      const cachedData = CacheService.get('userCache', 'nonexistent:key');
      expect(cachedData).toBeNull();
    });

    test('should clear cache successfully', async () => {
      const clearResult = CacheService.clear('userCache');
      expect(clearResult).toBe(true);
    });

    test('should get cache statistics', async () => {
      const stats = CacheService.getStats('userCache');
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });

  // Justification: Security Tests - Test security hardening features
  // Provides validation of security measures and threat detection
  // Essential for system security and compliance
  describe('Security System', () => {
    test('should sanitize input data', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = SecurityService.sanitizeInput(maliciousInput, 'html');
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    test('should validate file uploads', () => {
      const validFile = {
        name: 'test.pdf',
        size: 1024 * 1024 // 1MB
      };
      
      const validation = SecurityService.validateFileUpload(validFile);
      expect(validation.isValid).toBe(true);
    });

    test('should reject malicious file names', () => {
      const maliciousFile = {
        name: '../../../etc/passwd',
        size: 1024
      };
      
      const validation = SecurityService.validateFileUpload(maliciousFile);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should generate secure filenames', () => {
      const originalName = 'test.pdf';
      const secureName = SecurityService.generateSecureFilename(originalName);
      
      expect(secureName).not.toBe(originalName);
      expect(secureName).toMatch(/^\d+_[a-f0-9]+\.pdf$/);
    });

    test('should detect security threats', () => {
      const mockReq = {
        ip: '192.168.1.1',
        get: () => 'Test User Agent',
        user: { user_id: 'test', role: 'user' },
        url: '/api/test',
        method: 'GET'
      };
      
      const threat = SecurityService.detectThreat(mockReq, 'TEST_THREAT', {
        test: 'data'
      });
      
      expect(threat).toHaveProperty('type', 'TEST_THREAT');
      expect(threat).toHaveProperty('timestamp');
      expect(threat).toHaveProperty('ipAddress');
    });
  });

  // Justification: Error Handling Tests - Test error management
  // Provides validation of error handling and user feedback
  // Essential for system reliability and user experience
  describe('Error Handling System', () => {
    test('should handle validation errors gracefully', async () => {
      const invalidUserData = {
        name: '',
        email: 'invalid-email',
        mobile: '123',
        pan: 'INVALID'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
    });

    test('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_TOKEN');
    });

    test('should handle resource not found errors', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid-token-but-user-not-found');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should handle rate limiting', async () => {
      const requests = Array(105).fill().map(() => 
        request(app).get('/api/health')
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  // Justification: API Integration Tests - Test complete API workflows
  // Provides end-to-end testing of complete user workflows
  // Essential for ensuring system functionality and user experience
  describe('Complete API Workflows', () => {
    let userToken;
    let userId;

    beforeAll(async () => {
      const user = await TestUtils.createTestUser();
      userToken = await TestUtils.getAuthToken();
      userId = user.user_id;
    });

    test('should complete user registration to profile workflow', async () => {
      // 1. Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Workflow Test User',
          email: 'workflow.test@example.com',
          mobile: '9876543230',
          pan: 'ABCDE1250F',
          password: 'WorkflowPass123!'
        });

      expect(registerResponse.status).toBe(201);

      // 2. Login user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'workflow.test@example.com',
          password: 'WorkflowPass123!'
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.data.token;

      // 3. Get user profile
      const profileResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.email).toBe('workflow.test@example.com');
    });

    test('should handle CA assignment workflow', async () => {
      const caToken = await TestUtils.getAuthToken(TEST_CONFIG.TEST_CA);
      
      // 1. Create assignment
      const assignmentData = {
        client_name: 'Test Client',
        client_pan: 'ABCDE1260F',
        assignment_type: 'ITR_FILING',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const createResponse = await request(app)
        .post('/api/ca/assignments')
        .set('Authorization', `Bearer ${caToken}`)
        .send(assignmentData);

      expect(createResponse.status).toBe(201);
      const assignmentId = createResponse.body.data.assignment_id;

      // 2. Update assignment status
      const updateResponse = await request(app)
        .put(`/api/ca/assignments/${assignmentId}`)
        .set('Authorization', `Bearer ${caToken}`)
        .send({ status: 'in_progress' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.status).toBe('in_progress');
    });
  });
});

// Justification: Performance Benchmark Tests - Test system performance
// Provides performance validation and benchmarking
// Essential for system scalability and optimization
describe('Performance Benchmarks', () => {
  test('should handle concurrent user requests', async () => {
    const concurrentRequests = 10;
    const startTime = Date.now();
    
    const requests = Array(concurrentRequests).fill().map(() =>
      request(app).get('/api/health')
    );
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  test('should handle large audit log queries', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/audit/logs')
      .query({ limit: 1000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });
});

module.exports = {
  TestUtils,
  TEST_CONFIG
};
