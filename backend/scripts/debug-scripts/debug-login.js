// Debug script to test login functionality
const request = require('supertest');
const app = require('./src/server');

async function debugLogin() {
  console.log('🔍 Debugging login functionality...');
  
  // Test data
  const testUser = {
    name: 'Debug User',
    email: 'debug@test.com',
    mobile: '9876543210',
    pan: 'ABCDE1234F',
    password: 'DebugPass123!'
  };

  try {
    // Step 1: Try to login with existing user first
    console.log('🔑 Step 1: Attempting login with existing user...');
    const loginData = {
      identifier: testUser.email,
      password: testUser.password
    };
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response body:', JSON.stringify(loginResponse.body, null, 2));
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful with existing user');
      return;
    } else {
      console.log('❌ Login failed with existing user, trying registration...');
    }

    // Step 2: Register user (if login failed)
    console.log('📝 Step 2: Registering user...');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    console.log('Register response status:', registerResponse.status);
    console.log('Register response body:', JSON.stringify(registerResponse.body, null, 2));
    
    if (registerResponse.status === 201) {
      console.log('✅ User registered successfully');
      
      // Step 3: Try to login with newly registered user
      console.log('🔑 Step 3: Attempting login with newly registered user...');
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      console.log('New login response status:', newLoginResponse.status);
      console.log('New login response body:', JSON.stringify(newLoginResponse.body, null, 2));
      
      if (newLoginResponse.status === 200) {
        console.log('✅ Login successful with newly registered user');
      } else {
        console.log('❌ Login failed with newly registered user');
      }
    } else {
      console.log('❌ User registration failed');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugLogin();
