// Debug CA firm creation
const request = require('supertest');
const app = require('./src/server');

async function debugCA() {
  console.log('🔍 Debugging CA firm creation...');
  
  // Step 1: Register a test user
  const testUser = {
    name: 'CA Test User',
    email: 'ca.test@example.com',
    mobile: '9876543211',
    pan: 'ABCDE1241F',
    password: 'CATestPass123!'
  };
  
  try {
    console.log('📝 Step 1: Registering test user...');
    const registerResponse = await request(app).post('/api/auth/register').send(testUser);
    console.log('Register status:', registerResponse.status);
    console.log('Register body:', JSON.stringify(registerResponse.body, null, 2));
    
    if (registerResponse.status !== 201 && registerResponse.status !== 409) {
      console.log('❌ User registration failed');
      return;
    }
    
    // Step 2: Login to get token
    console.log('🔑 Step 2: Logging in...');
    const loginResponse = await request(app).post('/api/auth/login').send({
      identifier: testUser.email,
      password: testUser.password
    });
    
    console.log('Login status:', loginResponse.status);
    console.log('Login body:', JSON.stringify(loginResponse.body, null, 2));
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.body.data.token;
    console.log('✅ Login successful, got token');
    
    // Step 3: Create CA firm
    console.log('🏢 Step 3: Creating CA firm...');
    const caData = {
      name: 'Test CA Firm',
      email: 'testca2@example.com', // Changed email to avoid conflict
      dsc_details: {
        dsc_number: 'DSC123456789',
        valid_until: '2025-12-31'
      },
      contact_number: '9876543210',
      address: '123 Test Street, Test City, Test State 123456'
    };
    
    const caResponse = await request(app)
      .post('/api/ca/create')
      .set('Authorization', `Bearer ${token}`)
      .send(caData);
    
    console.log('CA creation status:', caResponse.status);
    console.log('CA creation body:', JSON.stringify(caResponse.body, null, 2));
    
    if (caResponse.status === 201) {
      console.log('✅ CA firm creation successful');
    } else {
      console.log('❌ CA firm creation failed');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugCA();
