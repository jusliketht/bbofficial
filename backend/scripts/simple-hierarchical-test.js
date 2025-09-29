#!/usr/bin/env node

// =====================================================
// HIERARCHICAL PLATFORM TESTING SCRIPT
// Tests the platform systematically from authentication to advanced features
// =====================================================

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3002';
const API_VERSION = ''; // Use main auth routes without version

// Test users (from database check)
const TEST_USERS = {
  super_admin: {
    email: 'admin@burnblack.com',
    password: 'password123',
    expectedRole: 'super_admin'
  },
  ca_firm_admin: {
    email: 'firmadmin@burnblack.com',
    password: 'password123',
    expectedRole: 'ca_firm_admin'
  },
  ca: {
    email: 'ca@burnblack.com',
    password: 'password123',
    expectedRole: 'CA'
  },
  user: {
    email: 'client@burnblack.com',
    password: 'password123',
    expectedRole: 'user'
  }
};

// Test results tracking
const testResults = {
  level1_auth: { passed: 0, failed: 0, tests: [] },
  level2_dashboard: { passed: 0, failed: 0, tests: [] },
  level3_infinite_render: { passed: 0, failed: 0, tests: [] },
  level4_itr_journey: { passed: 0, failed: 0, tests: [] },
  level5_smart_detection: { passed: 0, failed: 0, tests: [] },
  level6_complete_workflow: { passed: 0, failed: 0, tests: [] },
  level7_advanced_features: { passed: 0, failed: 0, tests: [] }
};

// Helper functions
function logTest(level, testName, status, details = '') {
  const result = { testName, status, details, timestamp: new Date().toISOString() };
  testResults[level].tests.push(result);
  
  if (status === 'PASS') {
    testResults[level].passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults[level].failed++;
    console.log(`❌ ${testName}`);
    if (details) console.log(`   Details: ${details}`);
  }
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
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

// =====================================================
// LEVEL 1: AUTHENTICATION TESTING
// =====================================================

async function testAuthentication() {
  console.log('\n🔐 LEVEL 1: AUTHENTICATION TESTING');
  console.log('=' .repeat(50));
  
  for (const [userType, user] of Object.entries(TEST_USERS)) {
    console.log(`\n👤 Testing ${userType} authentication...`);
    
    // Test login
    const loginResult = await makeRequest('POST', '/api/auth/login', {
      email: user.email,
      password: user.password
    });
    
    if (loginResult.success && loginResult.data.success) {
      logTest('level1_auth', `${userType} login`, 'PASS', `Token received`);
      
      // Debug: Log the response structure
      console.log(`   Response structure:`, JSON.stringify(loginResult.data, null, 2));
      
      // Store token for later tests
      user.token = loginResult.data.data?.accessToken || loginResult.data.data?.token || loginResult.data.accessToken || loginResult.data.token;
      
      // Test token validation
      const profileResult = await makeRequest('GET', '/api/auth/me', null, {
        'Authorization': `Bearer ${user.token}`
      });
      
      if (profileResult.success && profileResult.data.success) {
        const userRole = profileResult.data.user?.role || profileResult.data.data?.role;
        if (userRole === user.expectedRole) {
          logTest('level1_auth', `${userType} role validation`, 'PASS', `Role: ${userRole}`);
        } else {
          logTest('level1_auth', `${userType} role validation`, 'FAIL', `Expected: ${user.expectedRole}, Got: ${userRole}`);
        }
      } else {
        logTest('level1_auth', `${userType} profile fetch`, 'FAIL', profileResult.error);
      }
      
    } else {
      logTest('level1_auth', `${userType} login`, 'FAIL', loginResult.error);
    }
  }
  
  // Test invalid credentials
  const invalidLoginResult = await makeRequest('POST', '/api/auth/login', {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  });
  
  if (!invalidLoginResult.success) {
    logTest('level1_auth', 'Invalid credentials rejection', 'PASS');
  } else {
    logTest('level1_auth', 'Invalid credentials rejection', 'FAIL', 'Should have rejected invalid credentials');
  }
}

// =====================================================
// LEVEL 2: DASHBOARD REDIRECTION TESTING
// =====================================================

async function testDashboardRedirection() {
  console.log('\n🏠 LEVEL 2: DASHBOARD REDIRECTION TESTING');
  console.log('=' .repeat(50));
  
  for (const [userType, user] of Object.entries(TEST_USERS)) {
    if (!user.token) {
      // Re-login if token is missing
      const loginResult = await makeRequest('POST', '/api/auth/login', {
        email: user.email,
        password: user.password
      });
      
      if (loginResult.success && loginResult.data.success) {
        user.token = loginResult.data.data?.accessToken || loginResult.data.data?.token || loginResult.data.accessToken || loginResult.data.token;
      } else {
        logTest('level2_dashboard', `${userType} dashboard access`, 'FAIL', 'Could not obtain token');
        continue;
      }
    }
    
    console.log(`\n🏠 Testing ${userType} dashboard access...`);
    
    // Test dashboard endpoint
    const dashboardResult = await makeRequest('GET', '/api/dashboard/stats', null, {
      'Authorization': `Bearer ${user.token}`
    });
    
    if (dashboardResult.success && dashboardResult.data.success) {
      logTest('level2_dashboard', `${userType} dashboard stats`, 'PASS', 'Dashboard data retrieved');
    } else {
      logTest('level2_dashboard', `${userType} dashboard stats`, 'FAIL', dashboardResult.error);
    }
  }
}

// =====================================================
// LEVEL 3: INFINITE RENDER PREVENTION TESTING
// =====================================================

async function testInfiniteRenderPrevention() {
  console.log('\n🔄 LEVEL 3: INFINITE RENDER PREVENTION TESTING');
  console.log('=' .repeat(50));
  
  // Test if infinite render prevention utilities are available
  try {
    const fs = require('fs');
    const path = require('path');
    
    const preventionUtilsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'utils', 'infiniteRenderPrevention.js');
    const debugWrapperPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'debug', 'RenderDebugWrapper.js');
    
    if (fs.existsSync(preventionUtilsPath)) {
      logTest('level3_infinite_render', 'Prevention utilities exist', 'PASS', 'infiniteRenderPrevention.js found');
    } else {
      logTest('level3_infinite_render', 'Prevention utilities exist', 'FAIL', 'infiniteRenderPrevention.js not found');
    }
    
    if (fs.existsSync(debugWrapperPath)) {
      logTest('level3_infinite_render', 'Debug wrapper exists', 'PASS', 'RenderDebugWrapper.js found');
    } else {
      logTest('level3_infinite_render', 'Debug wrapper exists', 'FAIL', 'RenderDebugWrapper.js not found');
    }
    
    // Test if useFilingList hook is optimized
    const useFilingListPath = path.join(__dirname, '..', 'frontend', 'src', 'hooks', 'useFilingList.js');
    if (fs.existsSync(useFilingListPath)) {
      const content = fs.readFileSync(useFilingListPath, 'utf8');
      if (content.includes('useStableCallback') || content.includes('useCallback')) {
        logTest('level3_infinite_render', 'useFilingList optimization', 'PASS', 'Hook uses stable callbacks');
      } else {
        logTest('level3_infinite_render', 'useFilingList optimization', 'FAIL', 'Hook not optimized');
      }
    }
    
    // Test if contexts are optimized
    const authContextPath = path.join(__dirname, '..', 'frontend', 'src', 'contexts', 'AuthContext.js');
    if (fs.existsSync(authContextPath)) {
      const content = fs.readFileSync(authContextPath, 'utf8');
      if (content.includes('useMemo') && content.includes('useCallback')) {
        logTest('level3_infinite_render', 'AuthContext optimization', 'PASS', 'Context properly memoized');
      } else {
        logTest('level3_infinite_render', 'AuthContext optimization', 'FAIL', 'Context not optimized');
      }
    }
    
  } catch (error) {
    logTest('level3_infinite_render', 'File system check', 'FAIL', error.message);
  }
}

// =====================================================
// LEVEL 4: ITR JOURNEY TESTING
// =====================================================

async function testITRJourney() {
  console.log('\n📋 LEVEL 4: ITR JOURNEY TESTING');
  console.log('=' .repeat(50));
  
  const user = TEST_USERS.user;
  
  // Re-login user
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: user.email,
    password: user.password
  });
  
  if (!loginResult.success || !loginResult.data.success) {
    logTest('level4_itr_journey', 'User login for ITR journey', 'FAIL', 'Could not login user');
    return;
  }
  
  user.token = loginResult.data.data.accessToken;
  
  // Test filing creation
  const filingResult = await makeRequest('POST', '/api/filings', {
    itr_type: 'ITR-1',
    assessment_year: '2023-24'
  }, {
    'Authorization': `Bearer ${user.token}`
  });
  
  if (filingResult.success && filingResult.data.success) {
    logTest('level4_itr_journey', 'Filing creation', 'PASS', 'Filing created successfully');
    user.filingId = filingResult.data.data.filing_id;
  } else {
    logTest('level4_itr_journey', 'Filing creation', 'FAIL', filingResult.error);
  }
}

// =====================================================
// LEVEL 5: SMART ITR DETECTION TESTING
// =====================================================

async function testSmartITRDetection() {
  console.log('\n🧠 LEVEL 5: SMART ITR DETECTION TESTING');
  console.log('=' .repeat(50));
  
  const user = TEST_USERS.user;
  
  if (!user.token) {
    logTest('level5_smart_detection', 'User authentication', 'FAIL', 'No token available');
    return;
  }
  
  // Test different income scenarios
  const scenarios = [
    {
      name: 'Salary only',
      data: {
        income_sources: ['salary'],
        has_business: false,
        has_capital_gains: false,
        has_house_property: false
      },
      expectedITR: 'ITR-1'
    }
  ];
  
  for (const scenario of scenarios) {
    const result = await makeRequest('POST', '/api/itr-determination', scenario.data, {
      'Authorization': `Bearer ${user.token}`
    });
    
    if (result.success && result.data.success) {
      const recommendedITR = result.data.data.recommended_itr;
      if (recommendedITR === scenario.expectedITR) {
        logTest('level5_smart_detection', `${scenario.name} detection`, 'PASS', `Correctly recommended ${recommendedITR}`);
      } else {
        logTest('level5_smart_detection', `${scenario.name} detection`, 'FAIL', `Expected ${scenario.expectedITR}, got ${recommendedITR}`);
      }
    } else {
      logTest('level5_smart_detection', `${scenario.name} detection`, 'FAIL', result.error);
    }
  }
}

// =====================================================
// LEVEL 6: COMPLETE ITR WORKFLOW TESTING
// =====================================================

async function testCompleteITRWorkflow() {
  console.log('\n📝 LEVEL 6: COMPLETE ITR WORKFLOW TESTING');
  console.log('=' .repeat(50));
  
  const user = TEST_USERS.user;
  
  if (!user.token) {
    logTest('level6_complete_workflow', 'User authentication', 'FAIL', 'No token available');
    return;
  }
  
  // Test income source addition
  if (user.filingId) {
    const incomeResult = await makeRequest('POST', `/api/filings/${user.filingId}/income-sources`, {
      source_type: 'salary',
      amount: 500000,
      employer_name: 'Test Company',
      employer_tan: 'ABCD12345E',
      tax_deducted: 50000
    }, {
      'Authorization': `Bearer ${user.token}`
    });
    
    if (incomeResult.success) {
      logTest('level6_complete_workflow', 'Income source addition', 'PASS', 'Income source added');
    } else {
      logTest('level6_complete_workflow', 'Income source addition', 'FAIL', incomeResult.error);
    }
    
    // Test deduction addition
    const deductionResult = await makeRequest('POST', `/api/filings/${user.filingId}/deductions`, {
      deduction_type: 'section_80c',
      instrument_type: 'PPF',
      amount: 150000
    }, {
      'Authorization': `Bearer ${user.token}`
    });
    
    if (deductionResult.success) {
      logTest('level6_complete_workflow', 'Deduction addition', 'PASS', 'Deduction added');
    } else {
      logTest('level6_complete_workflow', 'Deduction addition', 'FAIL', deductionResult.error);
    }
  } else {
    logTest('level6_complete_workflow', 'Filing ID available', 'FAIL', 'No filing ID from previous test');
  }
}

// =====================================================
// LEVEL 7: ADVANCED FEATURES TESTING
// =====================================================

async function testAdvancedFeatures() {
  console.log('\n🚀 LEVEL 7: ADVANCED FEATURES TESTING');
  console.log('=' .repeat(50));
  
  const user = TEST_USERS.user;
  
  if (!user.token) {
    logTest('level7_advanced_features', 'User authentication', 'FAIL', 'No token available');
    return;
  }
  
  // Test service tickets
  const ticketsResult = await makeRequest('GET', `/api/${API_VERSION}/service-tickets`, null, {
    'Authorization': `Bearer ${user.token}`
  });
  
  if (ticketsResult.success) {
    logTest('level7_advanced_features', 'Service tickets access', 'PASS', 'Service tickets accessible');
  } else {
    logTest('level7_advanced_features', 'Service tickets access', 'FAIL', ticketsResult.error);
  }
  
  // Test health check
  const healthResult = await makeRequest('GET', '/health');
  
  if (healthResult.success) {
    logTest('level7_advanced_features', 'Health check', 'PASS', 'Health endpoint accessible');
  } else {
    logTest('level7_advanced_features', 'Health check', 'FAIL', healthResult.error);
  }
}

// =====================================================
// MAIN TESTING FUNCTION
// =====================================================

async function runHierarchicalTests() {
  console.log('🧪 BURNBLACK ITR FILING PLATFORM - HIERARCHICAL TESTING');
  console.log('=' .repeat(70));
  console.log('Testing platform systematically from authentication to advanced features...\n');
  
  try {
    // Level 1: Authentication
    await testAuthentication();
    
    // Level 2: Dashboard Redirection
    await testDashboardRedirection();
    
    // Level 3: Infinite Render Prevention
    await testInfiniteRenderPrevention();
    
    // Level 4: ITR Journey
    await testITRJourney();
    
    // Level 5: Smart ITR Detection
    await testSmartITRDetection();
    
    // Level 6: Complete ITR Workflow
    await testCompleteITRWorkflow();
    
    // Level 7: Advanced Features
    await testAdvancedFeatures();
    
    // Print final results
    printTestResults();
    
  } catch (error) {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  }
}

function printTestResults() {
  console.log('\n📊 FINAL TEST RESULTS');
  console.log('=' .repeat(70));
  
  const levels = [
    { name: 'Level 1: Authentication', key: 'level1_auth' },
    { name: 'Level 2: Dashboard Redirection', key: 'level2_dashboard' },
    { name: 'Level 3: Infinite Render Prevention', key: 'level3_infinite_render' },
    { name: 'Level 4: ITR Journey', key: 'level4_itr_journey' },
    { name: 'Level 5: Smart ITR Detection', key: 'level5_smart_detection' },
    { name: 'Level 6: Complete ITR Workflow', key: 'level6_complete_workflow' },
    { name: 'Level 7: Advanced Features', key: 'level7_advanced_features' }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  levels.forEach(level => {
    const result = testResults[level.key];
    const total = result.passed + result.failed;
    const percentage = total > 0 ? ((result.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n${level.name}:`);
    console.log(`  ✅ Passed: ${result.passed}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    console.log(`  📊 Success Rate: ${percentage}%`);
    
    totalPassed += result.passed;
    totalFailed += result.failed;
  });
  
  const overallTotal = totalPassed + totalFailed;
  const overallPercentage = overallTotal > 0 ? ((totalPassed / overallTotal) * 100).toFixed(1) : 0;
  
  console.log('\n🎯 OVERALL RESULTS:');
  console.log(`  ✅ Total Passed: ${totalPassed}`);
  console.log(`  ❌ Total Failed: ${totalFailed}`);
  console.log(`  📊 Overall Success Rate: ${overallPercentage}%`);
  
  if (overallPercentage >= 90) {
    console.log('\n🎉 EXCELLENT! Platform is ready for production!');
  } else if (overallPercentage >= 75) {
    console.log('\n👍 GOOD! Platform is mostly ready with minor issues.');
  } else if (overallPercentage >= 50) {
    console.log('\n⚠️  FAIR! Platform needs some fixes before production.');
  } else {
    console.log('\n🚨 POOR! Platform needs significant fixes.');
  }
  
  console.log('\n📋 Detailed test results saved to test-results.json');
  
  // Save detailed results
  const fs = require('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
}

// Run the tests
if (require.main === module) {
  runHierarchicalTests();
}

module.exports = { runHierarchicalTests, testResults };
