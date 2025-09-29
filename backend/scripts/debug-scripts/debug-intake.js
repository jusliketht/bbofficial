// Simple test to debug intake processing
const request = require('supertest');
const app = require('./src/server');

async function debugIntake() {
  console.log('🔍 Debugging intake processing...');
  
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
    
    let filingId;
    if (filingResponse.status === 409) {
      filingId = filingResponse.body.filingId;
    } else {
      filingId = filingResponse.body.data.filing_id;
    }
    
    console.log('✅ Filing created/retrieved, ID:', filingId);
    
    // Try to process intake data
    const intakeData = {
      filing_id: filingId,
      section: 'salary_income',
      user_input: {
        employer_name: 'Test Company',
        salary: 500000,
        allowances: 50000
      }
    };
    
    console.log('📝 Attempting intake processing...');
    const intakeResponse = await request(app)
      .post('/api/intake/process')
      .set('Authorization', `Bearer ${token}`)
      .send(intakeData);
    
    console.log('Intake response status:', intakeResponse.status);
    console.log('Intake response body:', JSON.stringify(intakeResponse.body, null, 2));
    
    if (intakeResponse.status === 200) {
      console.log('✅ Intake processing successful');
    } else {
      console.log('❌ Intake processing failed');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugIntake();
