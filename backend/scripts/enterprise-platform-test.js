/**
 * Enterprise Platform Test Suite - Complete Implementation
 * Comprehensive testing of authentication, RBAC, and multi-tenancy features
 */

const axios = require('axios');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3002',
  timeout: 30000,
  retries: 3
};

// Test users with enterprise roles
const TEST_USERS = {
  super_admin: { 
    email: 'admin@burnblack.com', 
    password: 'password123', 
    expectedRole: 'super_admin',
    tenantId: null
  },
  platform_admin: { 
    email: 'platform@burnblack.com', 
    password: 'password123', 
    expectedRole: 'platform_admin',
    tenantId: null
  },
  ca_firm_admin: { 
    email: 'firmadmin@burnblack.com', 
    password: 'password123', 
    expectedRole: 'ca_firm_admin',
    tenantId: 'test-firm-id'
  },
  ca: { 
    email: 'ca@burnblack.com', 
    password: 'password123', 
    expectedRole: 'CA',
    tenantId: 'test-firm-id'
  },
  user: { 
    email: 'client@burnblack.com', 
    password: 'password123', 
    expectedRole: 'user',
    tenantId: null
  }
};

// Test tenant data
const TEST_TENANT = {
  name: 'Test CA Firm',
  email: 'testfirm@example.com',
  contactNumber: '9876543210',
  address: '123 Test Street, Test City',
  type: 'ca_firm',
  adminData: {
    email: 'firmadmin@testfirm.com',
    name: 'Firm Admin',
    password: 'password123'
  }
};

class EnterprisePlatformTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.tokens = {};
    this.testTenantId = null;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${TEST_CONFIG.baseURL}${endpoint}`,
        timeout: TEST_CONFIG.timeout,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async test(testName, testFunction) {
    this.results.total++;
    this.log(`Testing: ${testName}`);
    
    try {
      const result = await testFunction();
      if (result.success) {
        this.results.passed++;
        this.log(`✅ PASSED: ${testName}`, 'success');
        this.results.details.push({ test: testName, status: 'PASSED', result });
      } else {
        this.results.failed++;
        this.log(`❌ FAILED: ${testName} - ${result.error}`, 'error');
        this.results.details.push({ test: testName, status: 'FAILED', error: result.error });
      }
    } catch (error) {
      this.results.failed++;
      this.log(`❌ ERROR: ${testName} - ${error.message}`, 'error');
      this.results.details.push({ test: testName, status: 'ERROR', error: error.message });
    }
  }

  // =====================================================
  // AUTHENTICATION TESTS
  // =====================================================

  async testUserLogin(userType) {
    const user = TEST_USERS[userType];
    const result = await this.makeRequest('POST', '/api/auth/login', {
      email: user.email,
      password: user.password
    });

    if (result.success && result.data.success) {
      this.tokens[userType] = result.data.tokens.accessToken;
      return {
        success: true,
        user: result.data.user,
        tokens: result.data.tokens
      };
    }

    return { success: false, error: result.error };
  }

  async testUserRegistration() {
    const testEmail = `testuser${Date.now()}@example.com`;
    const result = await this.makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      name: 'Test User',
      password: 'Password123!',
      registrationType: 'streamlined'
    });

    return result;
  }

  async testProfileAccess(userType) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    const result = await this.makeRequest('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${token}`
    });

    return result;
  }

  async testProfileUpdate(userType) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    const result = await this.makeRequest('PUT', '/api/auth/profile', {
      mobile: '9876543210',
      pan: 'TESTP1234A'
    }, {
      'Authorization': `Bearer ${token}`
    });

    return result;
  }

  async testTokenRefresh(userType) {
    const user = TEST_USERS[userType];
    const loginResult = await this.makeRequest('POST', '/api/auth/login', {
      email: user.email,
      password: user.password
    });

    if (!loginResult.success) {
      return { success: false, error: 'Login failed' };
    }

    const result = await this.makeRequest('POST', '/api/auth/refresh', {
      refreshToken: loginResult.data.tokens.refreshToken
    });

    return result;
  }

  // =====================================================
  // RBAC TESTS
  // =====================================================

  async testRoleAccess(userType, requiredRole) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    // Test accessing a role-protected endpoint
    const result = await this.makeRequest('GET', '/api/auth/roles', null, {
      'Authorization': `Bearer ${token}`
    });

    const expectedSuccess = ['super_admin', 'platform_admin'].includes(requiredRole);
    return {
      success: result.success === expectedSuccess,
      expected: expectedSuccess,
      actual: result.success,
      error: result.error
    };
  }

  async testPermissionAccess(userType) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    const result = await this.makeRequest('GET', '/api/auth/user-context', null, {
      'Authorization': `Bearer ${token}`
    });

    if (result.success) {
      const userRole = result.data.context.user.role;
      const permissions = result.data.context.permissions;
      const resources = result.data.context.resources;

      return {
        success: true,
        role: userRole,
        permissions: permissions.length,
        resources: Object.keys(resources).length
      };
    }

    return { success: false, error: result.error };
  }

  // =====================================================
  // MULTI-TENANT TESTS
  // =====================================================

  async testTenantCreation(userType) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    const result = await this.makeRequest('POST', '/api/auth/tenants', TEST_TENANT, {
      'Authorization': `Bearer ${token}`
    });

    if (result.success) {
      this.testTenantId = result.data.tenant.id;
    }

    return result;
  }

  async testTenantAccess(userType) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    if (!this.testTenantId) {
      return { success: false, error: 'No tenant ID available' };
    }

    const result = await this.makeRequest('GET', `/api/auth/tenants/${this.testTenantId}`, null, {
      'Authorization': `Bearer ${token}`
    });

    return result;
  }

  async testTenantUserManagement(userType) {
    const token = this.tokens[userType];
    if (!token) {
      return { success: false, error: 'No token available' };
    }

    if (!this.testTenantId) {
      return { success: false, error: 'No tenant ID available' };
    }

    // Test adding user to tenant
    const addUserResult = await this.makeRequest('POST', `/api/auth/tenants/${this.testTenantId}/users`, {
      email: `tenantuser${Date.now()}@example.com`,
      name: 'Tenant User',
      password: 'Password123!',
      role: 'user'
    }, {
      'Authorization': `Bearer ${token}`
    });

    return addUserResult;
  }

  // =====================================================
  // HEALTH CHECK TESTS
  // =====================================================

  async testHealthCheck() {
    const result = await this.makeRequest('GET', '/api/auth/health');
    
    if (result.success) {
      return {
        success: true,
        service: result.data.service,
        status: result.data.status,
        features: result.data.features
      };
    }

    return { success: false, error: result.error };
  }

  // =====================================================
  // COMPREHENSIVE TEST SUITE
  // =====================================================

  async runAllTests() {
    this.log('🚀 Starting Enterprise Platform Test Suite');
    this.log('=' .repeat(60));

    // Health Check Tests
    await this.test('Health Check', () => this.testHealthCheck());

    // Authentication Tests
    await this.test('User Registration (Streamlined)', () => this.testUserRegistration());
    
    for (const userType of Object.keys(TEST_USERS)) {
      await this.test(`${userType} Login`, () => this.testUserLogin(userType));
      await this.test(`${userType} Profile Access`, () => this.testProfileAccess(userType));
      await this.test(`${userType} Profile Update`, () => this.testProfileUpdate(userType));
      await this.test(`${userType} Token Refresh`, () => this.testTokenRefresh(userType));
      await this.test(`${userType} Permission Access`, () => this.testPermissionAccess(userType));
    }

    // RBAC Tests
    await this.test('Super Admin Role Access', () => this.testRoleAccess('super_admin', 'super_admin'));
    await this.test('Platform Admin Role Access', () => this.testRoleAccess('platform_admin', 'platform_admin'));
    await this.test('CA Firm Admin Role Access', () => this.testRoleAccess('ca_firm_admin', 'ca_firm_admin'));
    await this.test('Regular User Role Access', () => this.testRoleAccess('user', 'user'));

    // Multi-Tenant Tests
    await this.test('Super Admin Tenant Creation', () => this.testTenantCreation('super_admin'));
    await this.test('Super Admin Tenant Access', () => this.testTenantAccess('super_admin'));
    await this.test('Super Admin Tenant User Management', () => this.testTenantUserManagement('super_admin'));

    // Test Results Summary
    this.log('=' .repeat(60));
    this.log('📊 TEST RESULTS SUMMARY');
    this.log(`Total Tests: ${this.results.total}`);
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, 'error');
    this.log(`Success Rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);

    if (this.results.failed > 0) {
      this.log('\n❌ FAILED TESTS:');
      this.results.details
        .filter(detail => detail.status !== 'PASSED')
        .forEach(detail => {
          this.log(`  - ${detail.test}: ${detail.error || 'Unknown error'}`, 'error');
        });
    }

    this.log('\n🏆 Enterprise Platform Test Suite Complete!');
    
    return this.results;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EnterprisePlatformTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = EnterprisePlatformTester;
