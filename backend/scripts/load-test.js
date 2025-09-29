import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.05'],            // Custom error rate below 5%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUsers = [
  { email: 'testuser1@example.com', password: 'password123' },
  { email: 'testuser2@example.com', password: 'password123' },
  { email: 'testuser3@example.com', password: 'password123' },
];

let authTokens = {};

// Setup function - runs once at the beginning
export function setup() {
  console.log('🚀 Starting Burnblack ITR Platform Load Test');
  console.log(`📡 Testing against: ${BASE_URL}`);
  
  // Authenticate test users
  for (let user of testUsers) {
    const loginResponse = http.post(`${API_BASE}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginResponse.status === 200) {
      const loginData = JSON.parse(loginResponse.body);
      authTokens[user.email] = loginData.data.accessToken;
      console.log(`✅ Authenticated user: ${user.email}`);
    } else {
      console.log(`❌ Failed to authenticate user: ${user.email}`);
    }
  }
  
  return { authTokens };
}

// Main test function
export default function(data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const token = data.authTokens[user.email];
  
  if (!token) {
    console.log(`❌ No token for user: ${user.email}`);
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Test scenarios
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Health check
    testHealthCheck();
  } else if (scenario < 0.5) {
    // 20% - User profile operations
    testUserProfile(headers);
  } else if (scenario < 0.7) {
    // 20% - ITR journey operations
    testITRJourney(headers);
  } else if (scenario < 0.85) {
    // 15% - Service ticket operations
    testServiceTickets(headers);
  } else {
    // 15% - Document upload operations
    testDocumentUpload(headers);
  }
  
  sleep(1);
}

// Health check test
function testHealthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  const success = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
    'health check has status field': (r) => JSON.parse(r.body).status !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
}

// User profile test
function testUserProfile(headers) {
  // Get user profile
  const profileResponse = http.get(`${API_BASE}/auth/me`, { headers });
  
  const success = check(profileResponse, {
    'profile request status is 200': (r) => r.status === 200,
    'profile response time < 300ms': (r) => r.timings.duration < 300,
    'profile has user data': (r) => JSON.parse(r.body).data !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(profileResponse.timings.duration);
}

// ITR journey test
function testITRJourney(headers) {
  // Get ITR journey list
  const journeyResponse = http.get(`${API_BASE}/v2/itr-journey`, { headers });
  
  const success = check(journeyResponse, {
    'journey list status is 200': (r) => r.status === 200,
    'journey response time < 400ms': (r) => r.timings.duration < 400,
    'journey has data field': (r) => JSON.parse(r.body).data !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(journeyResponse.timings.duration);
}

// Service tickets test
function testServiceTickets(headers) {
  // Get service tickets
  const ticketsResponse = http.get(`${API_BASE}/tickets`, { headers });
  
  const success = check(ticketsResponse, {
    'tickets status is 200': (r) => r.status === 200,
    'tickets response time < 500ms': (r) => r.timings.duration < 500,
    'tickets has data field': (r) => JSON.parse(r.body).data !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(ticketsResponse.timings.duration);
}

// Document upload test (simulated)
function testDocumentUpload(headers) {
  // Simulate document upload by checking upload endpoint
  const uploadResponse = http.get(`${API_BASE}/upload/status`, { headers });
  
  const success = check(uploadResponse, {
    'upload status is 200': (r) => r.status === 200,
    'upload response time < 600ms': (r) => r.timings.duration < 600,
  });
  
  errorRate.add(!success);
  responseTime.add(uploadResponse.timings.duration);
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('🏁 Load test completed');
  console.log(`📊 Tested ${BASE_URL} with various scenarios`);
}
