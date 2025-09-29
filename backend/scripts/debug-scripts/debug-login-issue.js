// Simple test to debug login issue
const request = require('supertest');
const app = require('./src/server');

async function debugLoginIssue() {
  console.log('🔍 Debugging login issue...');
  
  const testUser = {
    name: 'Integration Test User',
    email: 'integration.test@example.com',
    mobile: '9876543220',
    pan: 'ABCDE1240F',
    password: 'IntegrationPass123!'
  };

  try {
    // Step 1: Try to register the user
    console.log('📝 Step 1: Registering user...');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    console.log('Register status:', registerResponse.status);
    console.log('Register body:', JSON.stringify(registerResponse.body, null, 2));
    
    // Step 2: Try to login
    console.log('🔑 Step 2: Attempting login...');
    const loginData = {
      identifier: testUser.email,
      password: testUser.password
    };
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    
    console.log('Login status:', loginResponse.status);
    console.log('Login body:', JSON.stringify(loginResponse.body, null, 2));
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed with status:', loginResponse.status);
      console.log('Error message:', loginResponse.body.error);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugLoginIssue();
