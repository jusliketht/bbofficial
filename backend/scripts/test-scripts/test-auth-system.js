const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002/api';

// Test configuration
const testUsers = [
  {
    name: 'Individual User',
    email: 'test@individual.com',
    password: 'Test@123',
    expectedRole: 'user',
    expectedDashboard: '/user/dashboard'
  },
  {
    name: 'CA Firm Admin',
    email: 'test@cafirm.com',
    password: 'Test@123',
    expectedRole: 'ca_firm_admin',
    expectedDashboard: '/ca-firm/dashboard'
  },
  {
    name: 'CA Staff',
    email: 'test@ca.com',
    password: 'Test@123',
    expectedRole: 'CA',
    expectedDashboard: '/ca-staff/dashboard'
  },
  {
    name: 'Entity',
    email: 'test@entity.com',
    password: 'Test@123',
    expectedRole: 'entity',
    expectedDashboard: '/entity/dashboard'
  },
  {
    name: 'Super Admin',
    email: 'test@admin.com',
    password: 'Test@123',
    expectedRole: 'super_admin',
    expectedDashboard: '/admin/dashboard'
  }
];

async function testAuthenticationFlow() {
  console.log('🧪 Testing Complete Authentication System...\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Backend Health Check
  console.log('📋 Test 1: Backend Health Check');
  totalTests++;
  try {
    const healthResponse = await axios.get(`http://localhost:3002/health`);
    if (healthResponse.status === 200) {
      console.log('✅ Backend is running and healthy');
      passedTests++;
    } else {
      console.log('❌ Backend health check failed');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    failedTests++;
  }

  // Test 2: Login for each user type
  console.log('\n📋 Test 2: User Authentication Tests');
  
  for (const user of testUsers) {
    totalTests++;
    console.log(`\n🔐 Testing ${user.name} login...`);
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (loginResponse.status === 200 && loginResponse.data.success) {
        const data = loginResponse.data.data;
        
        // Verify response structure
        const hasRequiredFields = data.userId && data.role && data.token && data.dashboardRoute && data.dashboardConfig && data.welcomeMessage;
        
        if (!hasRequiredFields) {
          console.log(`❌ ${user.name}: Missing required fields in response`);
          failedTests++;
          continue;
        }

        // Verify role matching
        if (data.role !== user.expectedRole) {
          console.log(`❌ ${user.name}: Role mismatch. Expected: ${user.expectedRole}, Got: ${data.role}`);
          failedTests++;
          continue;
        }

        // Verify dashboard route
        if (data.dashboardRoute !== user.expectedDashboard) {
          console.log(`❌ ${user.name}: Dashboard route mismatch. Expected: ${user.expectedDashboard}, Got: ${data.dashboardRoute}`);
          failedTests++;
          continue;
        }

        // Verify dashboard config
        if (!data.dashboardConfig || !data.dashboardConfig.title) {
          console.log(`❌ ${user.name}: Missing dashboard configuration`);
          failedTests++;
          continue;
        }

        // Verify welcome message
        if (!data.welcomeMessage) {
          console.log(`❌ ${user.name}: Missing welcome message`);
          failedTests++;
          continue;
        }

        console.log(`✅ ${user.name}: Login successful`);
        console.log(`   Role: ${data.role}`);
        console.log(`   Dashboard: ${data.dashboardRoute}`);
        console.log(`   Title: ${data.dashboardConfig.title}`);
        console.log(`   Welcome: ${data.welcomeMessage}`);
        
        passedTests++;

        // Test 3: Token Verification
        totalTests++;
        try {
          const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify`, {
            token: data.token
          });

          if (verifyResponse.status === 200 && verifyResponse.data.success) {
            console.log(`✅ ${user.name}: Token verification successful`);
            passedTests++;
          } else {
            console.log(`❌ ${user.name}: Token verification failed`);
            failedTests++;
          }
        } catch (error) {
          console.log(`❌ ${user.name}: Token verification failed:`, error.message);
          failedTests++;
        }

      } else {
        console.log(`❌ ${user.name}: Login failed - ${loginResponse.data.error || 'Unknown error'}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${user.name}: Login failed - ${error.message}`);
      failedTests++;
    }
  }

  // Test 4: Invalid Login Attempts
  console.log('\n📋 Test 4: Invalid Login Attempts');
  
  const invalidTests = [
    { email: 'nonexistent@test.com', password: 'Test@123', description: 'Non-existent email' },
    { email: 'test@individual.com', password: 'WrongPassword', description: 'Wrong password' },
    { email: '', password: 'Test@123', description: 'Empty email' },
    { email: 'test@individual.com', password: '', description: 'Empty password' }
  ];

  for (const test of invalidTests) {
    totalTests++;
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: test.email,
        password: test.password
      });
      console.log(`❌ ${test.description}: Should have failed but succeeded`);
      failedTests++;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ ${test.description}: Correctly rejected`);
        passedTests++;
      } else {
        console.log(`❌ ${test.description}: Unexpected error: ${error.message}`);
        failedTests++;
      }
    }
  }

  // Test 5: Registration Test
  console.log('\n📋 Test 5: User Registration Test');
  totalTests++;
  try {
    const registerData = {
      name: 'Test Registration User',
      firstName: 'Test',
      lastName: 'Registration',
      email: 'test@registration.com',
      mobile: '9876543299',
      pan: 'ZYXWV9876A',
      role: 'user',
      password: 'Test@123'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);

    if (registerResponse.status === 201 && registerResponse.data.success) {
      console.log('✅ User registration successful');
      passedTests++;
    } else {
      console.log('❌ User registration failed');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ User registration failed:', error.message);
    failedTests++;
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('==============');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Authentication system is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Test frontend integration');
  console.log('2. Test dashboard routing');
  console.log('3. Test role-based access control');
  console.log('4. Test session management');
}

// Run the tests
testAuthenticationFlow().catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});
