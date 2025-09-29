// Simple test to debug filing creation
const request = require('supertest');
const app = require('./src/server');

async function debugFilingCreation() {
  console.log('🔍 Debugging filing creation...');
  
  try {
    // First, login to get a token
    const loginData = {
      identifier: 'test@example.com',
      password: 'TestPass123!'
    };
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status, loginResponse.body);
      return;
    }
    
    const token = loginResponse.body.data.token;
    console.log('✅ Login successful, got token');
    
    // Try to create a filing
    const filingData = {
      assessmentYear: '2025-26',
      filingFor: 'self',
      itrType: 'ITR-1',
      filingMode: 'self'
    };
    
    const filingResponse = await request(app)
      .post('/api/filing/create')
      .set('Authorization', `Bearer ${token}`)
      .send(filingData);
    
    console.log('Filing response status:', filingResponse.status);
    console.log('Filing response body:', JSON.stringify(filingResponse.body, null, 2));
    
    if (filingResponse.status === 201) {
      console.log('✅ Filing created successfully!');
    } else if (filingResponse.status === 409) {
      console.log('⚠️ Filing already exists for this assessment year');
      console.log('Existing filing ID:', filingResponse.body.filingId);
    } else {
      console.log('❌ Filing creation failed');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugFilingCreation();
