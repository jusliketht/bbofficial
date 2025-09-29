// Justification: Basic Auth Test - Phase 4 Testing Enhancement
// Provides simple authentication test without complex setup
// Essential for isolating and debugging authentication issues
// Validates basic auth functionality before comprehensive testing

const request = require('supertest');
const app = require('../src/server');

describe('Basic Authentication Test', () => {
  test('should register a new user', async () => {
    const newUser = {
      name: 'Basic Test User',
      email: 'basictest@example.com',
      mobile: '9876543214',
      pan: 'ABCDE1238F',
      password: 'BasicPass123!'
    };

    console.log('Attempting to register user:', newUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    if (response.status === 409) {
      console.log('User already exists, this is expected for duplicate test runs');
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    } else {
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('user_id');
      expect(response.body.data.user.email).toBe(newUser.email);
    }
  });

  test('should handle duplicate registration gracefully', async () => {
    const duplicateUser = {
      name: 'Duplicate Test User',
      email: 'duplicate@example.com',
      mobile: '9876543215',
      pan: 'ABCDE1239F',
      password: 'DuplicatePass123!'
    };

    // First registration
    const response1 = await request(app)
      .post('/api/auth/register')
      .send(duplicateUser);

    expect(response1.status).toBe(201);
    expect(response1.body.success).toBe(true);

    // Second registration with same data
    const response2 = await request(app)
      .post('/api/auth/register')
      .send(duplicateUser);

    expect(response2.status).toBe(409);
    expect(response2.body.success).toBe(false);
    expect(response2.body.error).toContain('already exists');
  });
});
