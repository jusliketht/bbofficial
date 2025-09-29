// Justification: Test Database Configuration - Isolated test environment setup
// Provides separate database configuration for testing to avoid production data contamination
// Essential for reliable and repeatable testing with proper data isolation
// Supports parallel test execution and clean test data management

const { Pool } = require('pg');

// Justification: Test database configuration with environment variable support
// Uses separate test database to avoid production data contamination
// Supports different environments (local, CI/CD, staging)
const testConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'itr_test',
  user: process.env.TEST_DB_USER || 'test_user',
  password: process.env.TEST_DB_PASSWORD || 'test_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Justification: Test database pool for connection management
// Provides connection pooling for efficient test execution
// Handles connection lifecycle and cleanup
const testPool = new Pool(testConfig);

// Justification: Test database connection validation
// Ensures test database is accessible before running tests
// Provides clear error messages for setup issues
const validateTestDatabase = async () => {
  try {
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Test database connection validated');
    return true;
  } catch (error) {
    console.error('❌ Test database connection failed:', error.message);
    console.error('Please ensure test database is running and accessible');
    return false;
  }
};

// Justification: Test database cleanup utility
// Removes all test data to ensure clean test environment
// Supports both full cleanup and selective cleanup
const cleanupTestDatabase = async () => {
  const client = await testPool.connect();
  
  try {
    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');
    
    // Clean up all tables in reverse dependency order
    const tables = [
      'audit_events',
      'consent_logs', 
      'tax_computations',
      'documents',
      'deductions',
      'income_heads',
      'filing_submissions',
      'filing_declarations',
      'verification_sessions',
      'bank_accounts',
      'personal_info',
      'tax_payments',
      'ca_assignments',
      'bulk_jobs',
      'house_properties',
      'property_co_owners',
      'capital_gains',
      'foreign_income',
      'foreign_assets',
      'shareholding_details',
      'business_profession',
      'business_partners',
      'balance_sheet_items',
      'presumptive_business',
      'intake_data',
      'user_sessions',
      'users',
      'ca_firms',
      'assessment_years',
      'itr_forms'
    ];
    
    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      } catch (error) {
        // Table might not exist, continue
        console.warn(`Warning: Could not truncate table ${table}:`, error.message);
      }
    }
    
    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Test database cleaned up successfully');
    
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Justification: Test database setup for initial data
// Creates necessary lookup data for tests
// Ensures consistent test environment
const setupTestDatabase = async () => {
  const client = await testPool.connect();
  
  try {
    // Insert assessment years
    await client.query(`
      INSERT INTO assessment_years (ay_code, financial_year_start, financial_year_end, filing_due_date) VALUES
      ('2024-25', '2023-04-01', '2024-03-31', '2024-07-31'),
      ('2025-26', '2024-04-01', '2025-03-31', '2025-07-31')
      ON CONFLICT (ay_code) DO NOTHING;
    `);

    // Insert ITR forms
    await client.query(`
      INSERT INTO itr_forms (itr_type, form_name, description, eligibility_rules) VALUES
      ('ITR-1', 'Sahaj', 'For individuals with salary, pension, house property, and other sources', '{"max_house_properties": 1, "no_business": true, "no_capital_gains": true}'),
      ('ITR-2', 'For individuals and HUFs not having income from business or profession', 'For individuals with capital gains, multiple house properties', '{"max_house_properties": 10, "no_business": true}'),
      ('ITR-3', 'For individuals and HUFs having income from profits and gains of business or profession', 'For individuals with business income', '{"business_income": true}'),
      ('ITR-4', 'Sugam', 'For individuals, HUFs and Firms (other than LLP) having presumptive business income', '{"presumptive_business": true, "max_turnover": 2000000}')
      ON CONFLICT (itr_type) DO NOTHING;
    `);

    // Insert test CA firm
    await client.query(`
      INSERT INTO ca_firms (firm_id, firm_name, firm_pan, registration_number, address, contact_details) VALUES
      (uuid_generate_v4(), 'Test CA Firm', 'TESTC1234F', 'TEST123', '{"line1": "Test Address", "city": "Test City", "state": "Test State", "pincode": "123456"}', '{"phone": "1234567890", "email": "test@cafirm.com"}')
      ON CONFLICT (firm_pan) DO NOTHING;
    `);

    console.log('✅ Test database setup completed');
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Justification: Test database connection management
// Provides utilities for test database lifecycle management
// Ensures proper cleanup and resource management
const closeTestDatabase = async () => {
  try {
    await testPool.end();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Error closing test database:', error);
  }
};

// Justification: Test database health check
// Validates test database connectivity and basic functionality
// Used in test setup and teardown
const healthCheckTestDatabase = async () => {
  try {
    const client = await testPool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    client.release();
    
    return {
      isHealthy: true,
      currentTime: result.rows[0].current_time,
      dbVersion: result.rows[0].db_version
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message
    };
  }
};

module.exports = {
  testConfig,
  testPool,
  validateTestDatabase,
  cleanupTestDatabase,
  setupTestDatabase,
  closeTestDatabase,
  healthCheckTestDatabase
};
