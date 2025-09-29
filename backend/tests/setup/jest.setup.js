// Justification: Jest Setup - Global test configuration and utilities
// Provides global test setup, teardown, and utility functions
// Essential for consistent test environment and proper test isolation
// Supports database setup, mocking, and test data management

const { 
  testPool, 
  validateTestDatabase, 
  cleanupTestDatabase, 
  setupTestDatabase,
  closeTestDatabase 
} = require('../config/test-database');

// Justification: Global test setup
// Configures test environment before all tests run
// Ensures database connectivity and proper test isolation
beforeAll(async () => {
  console.log('🚀 Setting up test environment...');
  
  // Validate test database connection
  const isHealthy = await validateTestDatabase();
  if (!isHealthy) {
    throw new Error('Test database is not accessible');
  }
  
  // Setup test database with initial data
  await setupTestDatabase();
  
  console.log('✅ Test environment setup completed');
});

// Justification: Global test teardown
// Cleans up test environment after all tests complete
// Ensures proper resource cleanup and database closure
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up test database
  await cleanupTestDatabase();
  
  // Close database connections
  await closeTestDatabase();
  
  console.log('✅ Test environment cleanup completed');
});

// Justification: Global test timeout configuration
// Sets appropriate timeout for different test types
// Ensures tests don't hang indefinitely
jest.setTimeout(30000);

// Justification: Global error handling
// Provides consistent error handling across all tests
// Ensures proper error reporting and test failure handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in test environment
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in test environment
});

// Justification: Global test utilities
// Provides common test utilities and helpers
// Ensures consistent test data and mocking across tests
global.testUtils = {
  // Generate unique test data
  generateUniqueTestData: () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return {
      timestamp,
      random,
      uniqueId: `${timestamp}_${random}`
    };
  },
  
  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock console methods to reduce noise in tests
  mockConsole: () => {
    const originalConsole = { ...console };
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    return originalConsole;
  },
  
  // Restore console methods
  restoreConsole: (originalConsole) => {
    Object.assign(console, originalConsole);
  },
  
  // Create test user data
  createTestUserData: (overrides = {}) => {
    const uniqueData = global.testUtils.generateUniqueTestData();
    return {
      pan: `TEST${uniqueData.random}${uniqueData.timestamp.toString().slice(-4)}F`,
      mobile_hash: `test_mobile_${uniqueData.uniqueId}`,
      email_hash: `test_email_${uniqueData.uniqueId}`,
      consent_timestamp: new Date().toISOString(),
      consent_ip: '127.0.0.1',
      locale: 'en',
      is_active: true,
      ...overrides
    };
  },
  
  // Create test intake data
  createTestIntakeData: (overrides = {}) => {
    const uniqueData = global.testUtils.generateUniqueTestData();
    return {
      ay_code: '2024-25',
      itr_type: 'ITR-1',
      status: 'DRAFT',
      full_name: `Test User ${uniqueData.uniqueId}`,
      father_name: `Test Father ${uniqueData.uniqueId}`,
      date_of_birth: '1990-01-01',
      gender: 'M',
      aadhaar: `9999${uniqueData.timestamp.toString().slice(-8)}`,
      filing_for: 'self',
      residential_status: 'Resident',
      country_of_residence: 'India',
      address: {
        line1: `Test Address Line 1 ${uniqueData.uniqueId}`,
        line2: `Test Address Line 2 ${uniqueData.uniqueId}`,
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
      verified_at: null,
      ...overrides
    };
  }
};

// Justification: Global test matchers
// Provides custom Jest matchers for better test assertions
// Ensures consistent and readable test assertions
expect.extend({
  // Check if value is a valid UUID
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass
    };
  },
  
  // Check if value is a valid PAN
  toBeValidPAN(received) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const pass = panRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid PAN`,
      pass
    };
  },
  
  // Check if value is a valid Aadhaar
  toBeValidAadhaar(received) {
    const aadhaarRegex = /^[0-9]{12}$/;
    const pass = aadhaarRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid Aadhaar`,
      pass
    };
  },
  
  // Check if value is a valid IFSC code
  toBeValidIFSC(received) {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const pass = ifscRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid IFSC code`,
      pass
    };
  },
  
  // Check if value is a valid date string
  toBeValidDateString(received) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime()) && received.includes('T');
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid ISO date string`,
      pass
    };
  },
  
  // Check if value is a valid monetary amount
  toBeValidMonetaryAmount(received) {
    const pass = typeof received === 'number' && received >= 0 && !isNaN(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid monetary amount`,
      pass
    };
  },
  
  // Check if value is a valid tax regime
  toBeValidTaxRegime(received) {
    const validRegimes = ['OLD', 'NEW'];
    const pass = validRegimes.includes(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid tax regime`,
      pass
    };
  },
  
  // Check if value is a valid ITR type
  toBeValidITRType(received) {
    const validTypes = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'];
    const pass = validTypes.includes(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid ITR type`,
      pass
    };
  },
  
  // Check if value is a valid assessment year
  toBeValidAssessmentYear(received) {
    const yearRegex = /^\d{4}-\d{2}$/;
    const pass = yearRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid assessment year`,
      pass
    };
  }
});

// Justification: Global test environment variables
// Sets up test-specific environment variables
// Ensures consistent test environment configuration
process.env.NODE_ENV = 'test';
process.env.TEST_DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.TEST_DB_PORT = process.env.TEST_DB_PORT || '5432';
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'itr_test';
process.env.TEST_DB_USER = process.env.TEST_DB_USER || 'test_user';
process.env.TEST_DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'test_password';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-32-chars';

// Justification: Global test logging
// Provides consistent logging for test execution
// Helps with debugging and test monitoring
global.testLogger = {
  info: (message) => console.log(`ℹ️  ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  warning: (message) => console.log(`⚠️  ${message}`),
  error: (message) => console.log(`❌ ${message}`),
  debug: (message) => console.log(`🐛 ${message}`)
};

// Justification: Global test performance monitoring
// Tracks test execution performance
// Helps identify slow tests and performance issues
global.testPerformance = {
  startTime: Date.now(),
  
  getElapsedTime: () => Date.now() - global.testPerformance.startTime,
  
  logPerformance: (testName, startTime) => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      global.testLogger.warning(`Slow test: ${testName} took ${duration}ms`);
    }
  }
};

console.log('🧪 Jest setup completed successfully');
