// Justification: Test Setup - Global test configuration and setup
// Provides test environment initialization and cleanup
// Essential for consistent test execution and environment management
// Supports test isolation and reliable test results

const { logger } = require('../src/utils/logger');

// Justification: Global Test Setup - Initialize test environment
// Provides test environment configuration and setup
// Essential for test consistency and environment management
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  
  // Suppress logger output during tests
  logger.info = jest.fn();
  logger.error = jest.fn();
  logger.warn = jest.fn();
  logger.debug = jest.fn();
  
  console.log('Test environment initialized');
});

// Justification: Global Test Teardown - Cleanup test environment
// Provides test environment cleanup and resource management
// Essential for test isolation and environment hygiene
afterAll(async () => {
  // Cleanup any remaining resources
  console.log('Test environment cleaned up');
});

// Justification: Test Timeout Configuration - Set test timeouts
// Provides appropriate timeout values for different test types
// Essential for test reliability and performance
jest.setTimeout(30000);

// Justification: Global Test Utilities - Common test helper functions
// Provides reusable test utilities and helper functions
// Essential for test efficiency and maintainability
global.testUtils = {
  // Generate test data
  generateTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: `test.${Date.now()}@example.com`,
    mobile: '9876543210',
    pan: 'ABCDE1234F',
    password: 'TestPass123!',
    ...overrides
  }),
  
  // Generate test CA data
  generateTestCA: (overrides = {}) => ({
    name: 'Test CA Firm',
    email: `ca.${Date.now()}@example.com`,
    mobile: '9876543211',
    pan: 'ABCDE1235F',
    password: 'TestPass123!',
    role: 'CA',
    ...overrides
  }),
  
  // Generate test admin data
  generateTestAdmin: (overrides = {}) => ({
    name: 'Test Admin',
    email: `admin.${Date.now()}@example.com`,
    mobile: '9876543212',
    pan: 'ABCDE1236F',
    password: 'TestPass123!',
    role: 'admin',
    ...overrides
  }),
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate random string
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Generate test PAN
  generateTestPAN: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pan = '';
    for (let i = 0; i < 5; i++) {
      pan += chars.charAt(Math.floor(Math.random() * 26));
    }
    for (let i = 0; i < 4; i++) {
      pan += chars.charAt(Math.floor(Math.random() * 10) + 26);
    }
    pan += chars.charAt(Math.floor(Math.random() * 26));
    return pan;
  }
};

// Justification: Mock Configuration - Configure test mocks
// Provides mock configuration for external dependencies
// Essential for test isolation and reliable test execution
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Justification: Environment Variables - Set test environment variables
// Provides test-specific environment configuration
// Essential for test environment consistency
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '3002',
  DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/itr_test',
  JWT_SECRET: 'test-jwt-secret',
  FRONTEND_URL: 'http://localhost:3000'
};
