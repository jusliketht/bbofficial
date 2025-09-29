/**
 * Enterprise Hierarchical Platform Test
 * Comprehensive testing using the enterprise API wrapper with versioning
 */

const path = require('path');
const EnterpriseAPIWrapper = require('../src/wrappers/enterpriseAPIWrapper');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3002',
  versions: ['v1', 'v2', 'latest'],
  timeout: 30000
};

// Test users with enterprise roles
const TEST_USERS = {
  super_admin: { 
    email: 'admin@burnblack.com', 
    password: 'password123', 
    expectedRole: 'super_admin',
    permissions: ['all']
  },
  ca_firm_admin: { 
    email: 'firmadmin@burnblack.com', 
    password: 'password123', 
    expectedRole: 'ca_firm_admin',
    permissions: ['firm_management', 'user_management']
  },
  ca: { 
    email: 'ca@burnblack.com', 
    password: 'password123', 
    expectedRole: 'CA',
    permissions: ['filing_management', 'itr_processing']
  },
  user: { 
    email: 'client@burnblack.com', 
    password: 'password123', 
    expectedRole: 'user',
    permissions: ['filing_access']
  }
};

class EnterprisePlatformTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
    this.apiClients = {};
  }

  // Utility methods
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test execution methods
  async runTest(testName, testFunction) {
    this.results.total++;
    this.log(`🧪 Running test: ${testName}`);
    
    try {
      await testFunction();
      this.results.passed++;
      this.log(`✅ Test passed: ${testName}`, 'success');
      return true;
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ test: testName, error: error.message });
      this.log(`❌ Test failed: ${testName} - ${error.message}`, 'error');
      return false;
    }
  }

  // Health check tests
  async testHealthCheck() {
    for (const version of TEST_CONFIG.versions) {
      const api = new EnterpriseAPIWrapper(TEST_CONFIG.baseURL, version);
      const health = await api.healthCheck();
      
      if (health.status !== 'success') {
        throw new Error(`Health check failed for ${version}: ${health.message}`);
      }
      
      this.log(`Health check passed for ${version}`);
    }
  }

  // Authentication tests
  async testAuthentication() {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      for (const version of TEST_CONFIG.versions) {
        const api = new EnterpriseAPIWrapper(TEST_CONFIG.baseURL, version);
        
        // Test login
        const loginResult = await api.login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResult.status !== 'success') {
          throw new Error(`Login failed for ${userType} (${version}): ${loginResult.message}`);
        }
        
        // Verify user data
        if (loginResult.data.user.role !== userData.expectedRole) {
          throw new Error(`Role mismatch for ${userType}: expected ${userData.expectedRole}, got ${loginResult.data.user.role}`);
        }
        
        // Store API client for later tests
        this.apiClients[`${userType}_${version}`] = api;
        
        this.log(`Authentication successful for ${userType} (${version})`);
      }
    }
  }

  // Profile tests
  async testProfileManagement() {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      for (const version of TEST_CONFIG.versions) {
        const api = this.apiClients[`${userType}_${version}`];
        
        // Test get profile
        const profileResult = await api.getProfile();
        
        if (profileResult.status !== 'success') {
          throw new Error(`Profile fetch failed for ${userType} (${version}): ${profileResult.message}`);
        }
        
        // Test update profile (if supported)
        if (version !== 'v1') {
          const updateData = {
            name: `Updated ${userData.expectedRole}`,
            mobile: '9876543210'
          };
          
          const updateResult = await api.updateProfile(updateData);
          
          if (updateResult.status !== 'success') {
            throw new Error(`Profile update failed for ${userType} (${version}): ${updateResult.message}`);
          }
        }
        
        this.log(`Profile management successful for ${userType} (${version})`);
      }
    }
  }

  // Dashboard tests
  async testDashboardAccess() {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      for (const version of TEST_CONFIG.versions) {
        const api = this.apiClients[`${userType}_${version}`];
        
        // Test dashboard stats
        const statsResult = await api.getDashboardStats();
        
        if (statsResult.status !== 'success') {
          throw new Error(`Dashboard stats failed for ${userType} (${version}): ${statsResult.message}`);
        }
        
        // Test notifications
        const notificationsResult = await api.getNotifications();
        
        if (notificationsResult.status !== 'success') {
          throw new Error(`Notifications failed for ${userType} (${version}): ${notificationsResult.message}`);
        }
        
        this.log(`Dashboard access successful for ${userType} (${version})`);
      }
    }
  }

  // Filing tests
  async testFilingManagement() {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      for (const version of TEST_CONFIG.versions) {
        const api = this.apiClients[`${userType}_${version}`];
        
        // Test get filings
        const filingsResult = await api.getFilings();
        
        if (filingsResult.status !== 'success') {
          throw new Error(`Filings fetch failed for ${userType} (${version}): ${filingsResult.message}`);
        }
        
        // Test create filing (if user has permission)
        if (['super_admin', 'ca_firm_admin', 'CA', 'user'].includes(userData.expectedRole)) {
          const filingData = {
            itrType: 'ITR-1',
            assessmentYear: '2024-25',
            status: 'draft'
          };
          
          const createResult = await api.createFiling(filingData);
          
          if (createResult.status !== 'success') {
            throw new Error(`Filing creation failed for ${userType} (${version}): ${createResult.message}`);
          }
          
          // Test get specific filing
          const filingId = createResult.data.id || 'test-filing-id';
          const getFilingResult = await api.getFiling(filingId);
          
          if (getFilingResult.status !== 'success') {
            throw new Error(`Filing fetch failed for ${userType} (${version}): ${getFilingResult.message}`);
          }
        }
        
        this.log(`Filing management successful for ${userType} (${version})`);
      }
    }
  }

  // ITR Journey tests
  async testITRJourney() {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
      for (const version of TEST_CONFIG.versions) {
        const api = this.apiClients[`${userType}_${version}`];
        
        // Test ITR determination
        const determinationData = {
          pan: 'CLIEN1234A',
          assessmentYear: '2024-25',
          incomeSources: ['salary', 'business']
        };
        
        const determinationResult = await api.getITRDetermination(determinationData);
        
        if (determinationResult.status !== 'success') {
          throw new Error(`ITR determination failed for ${userType} (${version}): ${determinationResult.message}`);
        }
        
        // Test enhanced features (v2+ only)
        if (version !== 'v1') {
          // Test PAN verification
          const panVerificationResult = await api.verifyPAN({
            pan: 'CLIEN1234A',
            name: 'Test User'
          });
          
          if (panVerificationResult.status !== 'success') {
            throw new Error(`PAN verification failed for ${userType} (${version}): ${panVerificationResult.message}`);
          }
          
          // Test smart ITR detection
          const smartDetectionResult = await api.getSmartITRDetection({
            pan: 'CLIEN1234A',
            previousYearData: true
          });
          
          if (smartDetectionResult.status !== 'success') {
            throw new Error(`Smart ITR detection failed for ${userType} (${version}): ${smartDetectionResult.message}`);
          }
        }
        
        this.log(`ITR journey successful for ${userType} (${version})`);
      }
    }
  }

  // Infinite render prevention tests
  async testInfiniteRenderPrevention() {
    const preventionUtilsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'utils', 'infiniteRenderPrevention.js');
    const debugWrapperPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'debug', 'RenderDebugWrapper.js');
    
    try {
      // Check if prevention utilities exist
      const fs = require('fs');
      
      if (!fs.existsSync(preventionUtilsPath)) {
        throw new Error('Infinite render prevention utilities not found');
      }
      
      if (!fs.existsSync(debugWrapperPath)) {
        throw new Error('Render debug wrapper not found');
      }
      
      // Read and validate the files
      const preventionUtils = fs.readFileSync(preventionUtilsPath, 'utf8');
      const debugWrapper = fs.readFileSync(debugWrapperPath, 'utf8');
      
      // Check for required functions
      const requiredFunctions = ['useRenderDebug', 'useDebouncedSetter', 'useStableCallback'];
      for (const func of requiredFunctions) {
        if (!preventionUtils.includes(func)) {
          throw new Error(`Required function ${func} not found in prevention utilities`);
        }
      }
      
      // Check for RenderDebugWrapper component
      if (!debugWrapper.includes('RenderDebugWrapper')) {
        throw new Error('RenderDebugWrapper component not found');
      }
      
      this.log('Infinite render prevention utilities validated successfully');
    } catch (error) {
      throw new Error(`Infinite render prevention test failed: ${error.message}`);
    }
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting Enterprise Hierarchical Platform Test Suite');
    this.log(`📡 Testing against: ${TEST_CONFIG.baseURL}`);
    this.log(`🔢 API Versions: ${TEST_CONFIG.versions.join(', ')}`);
    this.log(`👥 Test Users: ${Object.keys(TEST_USERS).join(', ')}`);
    
    const startTime = Date.now();
    
    // Run all test suites
    await this.runTest('Health Check', () => this.testHealthCheck());
    await this.runTest('Authentication', () => this.testAuthentication());
    await this.runTest('Profile Management', () => this.testProfileManagement());
    await this.runTest('Dashboard Access', () => this.testDashboardAccess());
    await this.runTest('Filing Management', () => this.testFilingManagement());
    await this.runTest('ITR Journey', () => this.testITRJourney());
    await this.runTest('Infinite Render Prevention', () => this.testInfiniteRenderPrevention());
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Print results
    this.log('\n📊 TEST RESULTS SUMMARY');
    this.log(`Total Tests: ${this.results.total}`);
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`Duration: ${duration}ms`);
    
    if (this.results.errors.length > 0) {
      this.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach(error => {
        this.log(`  - ${error.test}: ${error.error}`, 'error');
      });
    }
    
    const successRate = (this.results.passed / this.results.total) * 100;
    this.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      this.log('🏆 EXCELLENT! Platform is enterprise-ready!', 'success');
    } else if (successRate >= 75) {
      this.log('✅ GOOD! Platform is mostly ready with minor issues.', 'success');
    } else {
      this.log('⚠️ NEEDS WORK! Platform requires significant improvements.', 'warning');
    }
    
    return successRate;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EnterprisePlatformTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = EnterprisePlatformTester;
