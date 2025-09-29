const request = require('supertest');
const app = require('../server');
const { logger } = require('../utils/logger');

describe('Burnblack ITR Filing Platform - Backend Tests', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Setup test data
    logger.info('Setting up test environment');
  });

  afterAll(async () => {
    // Cleanup test data
    logger.info('Cleaning up test environment');
  });

  describe('Health Check', () => {
    test('GET /health should return system status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    test('POST /api/auth/register should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword',
          firstName: 'New',
          lastName: 'User'
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@example.com');
    });
  });

  describe('User Management', () => {
    test('GET /api/user/profile should return user profile', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });

    test('PUT /api/user/profile should update user profile', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        })
        .expect(200);

      expect(response.body.user.firstName).toBe('Updated');
    });
  });

  describe('ITR Filing', () => {
    test('POST /api/filing should create new filing', async () => {
      const response = await request(app)
        .post('/api/filing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itrType: 'ITR-1',
          assessmentYear: '2024-25',
          personalInfo: {
            firstName: 'Test',
            lastName: 'User'
          }
        })
        .expect(201);

      expect(response.body).toHaveProperty('filing');
      expect(response.body.filing.itrType).toBe('ITR-1');
    });

    test('GET /api/filing should return user filings', async () => {
      const response = await request(app)
        .get('/api/filing')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.filings)).toBe(true);
    });
  });

  describe('Tax Computation', () => {
    test('POST /api/tax/compute should calculate tax', async () => {
      const response = await request(app)
        .post('/api/tax/compute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          income: 500000,
          deductions: 50000,
          regime: 'new'
        })
        .expect(200);

      expect(response.body).toHaveProperty('taxComputation');
      expect(response.body.taxComputation).toHaveProperty('totalTax');
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid routes', async () => {
      const response = await request(app)
        .get('/api/invalid-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('Should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance Tests', () => {
    test('Health check should respond within 100ms', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    test('Login should respond within 500ms', async () => {
      const start = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        });
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });
});
