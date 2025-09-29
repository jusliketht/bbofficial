// Simple test to debug filing submission
const request = require('supertest');
const app = require('./src/server');

async function debugSubmit() {
  console.log('🔍 Debugging filing submission...');
  
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
    
    // Create a filing first
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
    
    let filingId;
    if (filingResponse.status === 409) {
      filingId = filingResponse.body.filingId;
    } else {
      filingId = filingResponse.body.data.filing_id;
    }
    
    console.log('Using filing ID:', filingId);
    
    // Try to submit the filing
    const submitResponse = await request(app)
      .post('/api/filing/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({ filing_id: filingId });
    
    console.log('Submit response status:', submitResponse.status);
    console.log('Submit response body:', JSON.stringify(submitResponse.body, null, 2));
    
    if (submitResponse.status === 200) {
      console.log('✅ Filing submission successful');
    } else {
      console.log('❌ Filing submission failed');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugSubmit();
