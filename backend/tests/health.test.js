// Justification: Simple Health Check Test - Basic system verification
// Provides basic verification of health check functionality
// Essential for ensuring system health monitoring works correctly

const request = require('supertest');
const app = require('../src/server');

describe('Health Check System', () => {
  test('should return basic health status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('should return ping response', async () => {
    const response = await request(app).get('/api/health/ping');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('pong', true);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('should return liveness status', async () => {
    const response = await request(app).get('/api/health/live');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'alive');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});
