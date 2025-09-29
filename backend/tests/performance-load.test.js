// Justification: Performance & Load Testing Suite - Phase 4 Task 4.4
// Provides comprehensive performance testing and load validation
// Essential for ensuring system scalability and performance under load
// Validates performance requirements and capacity planning

const request = require('supertest');
const app = require('../src/server');
const { performanceMonitor } = require('../src/services/performanceService');
const { CacheService } = require('../src/services/performanceService');
const { logger } = require('../src/utils/logger');

// Justification: Performance Test Configuration - Performance testing parameters
// Provides configurable performance testing parameters
// Essential for comprehensive performance validation
const PERFORMANCE_TEST_CONFIG = {
  // Load test scenarios
  LOAD_SCENARIOS: {
    NORMAL_LOAD: {
      name: 'Normal Load',
      concurrentUsers: 50,
      requestsPerUser: 10,
      rampUpTime: 30, // seconds
      duration: 300 // seconds
    },
    PEAK_LOAD: {
      name: 'Peak Load',
      concurrentUsers: 200,
      requestsPerUser: 20,
      rampUpTime: 60,
      duration: 600
    },
    STRESS_TEST: {
      name: 'Stress Test',
      concurrentUsers: 500,
      requestsPerUser: 30,
      rampUpTime: 120,
      duration: 900
    },
    SPIKE_TEST: {
      name: 'Spike Test',
      concurrentUsers: 1000,
      requestsPerUser: 5,
      rampUpTime: 10,
      duration: 120
    }
  },

  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    RESPONSE_TIME: {
      p50: 500, // 50th percentile in ms
      p90: 1000, // 90th percentile in ms
      p95: 2000, // 95th percentile in ms
      p99: 5000  // 99th percentile in ms
    },
    THROUGHPUT: {
      requestsPerSecond: 100,
      transactionsPerSecond: 50
    },
    ERROR_RATE: {
      maxPercentage: 1.0 // Maximum 1% error rate
    },
    MEMORY_USAGE: {
      maxPercentage: 80 // Maximum 80% memory usage
    },
    CPU_USAGE: {
      maxPercentage: 70 // Maximum 70% CPU usage
    }
  },

  // Test endpoints
  TEST_ENDPOINTS: [
    '/api/auth/login',
    '/api/user/profile',
    '/api/filing/list',
    '/api/filing/create',
    '/api/tax/compute',
    '/api/upload/document',
    '/health'
  ]
};

// Justification: Performance Test Suite - Comprehensive performance testing
// Provides testing for all performance aspects and load scenarios
// Essential for performance validation and capacity planning
describe('Performance & Load Testing Suite', () => {
  let testUsers = [];
  let authTokens = [];

  // Justification: Performance Test Setup - Prepare performance test environment
  // Provides clean environment for performance testing
  // Essential for reliable performance validation
  beforeAll(async () => {
    console.log('Setting up performance test environment...');
    
    // Create test users for authenticated performance tests
    testUsers = [];
    authTokens = [];
    await createTestUsers(10, testUsers, authTokens);
    
    console.log('Performance test environment setup completed');
  });

  // Justification: Baseline Performance Tests - Validate baseline performance
  // Provides baseline performance measurements
  // Essential for performance benchmarking
  describe('Baseline Performance', () => {
    test('should meet response time requirements for health check', async () => {
      const responseTimes = [];
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/health');

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        expect(response.status).toBe(200);
      }

      const sortedTimes = responseTimes.sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(0.5 * iterations)];
      const p90 = sortedTimes[Math.floor(0.9 * iterations)];
      const p95 = sortedTimes[Math.floor(0.95 * iterations)];
      const p99 = sortedTimes[Math.floor(0.99 * iterations)];

      expect(p50).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p50);
      expect(p90).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p90);
      expect(p95).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p95);
      expect(p99).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p99);

      logger.info('Health check performance', {
        p50, p90, p95, p99,
        average: responseTimes.reduce((a, b) => a + b, 0) / iterations
      });
    });

    test('should meet response time requirements for authenticated endpoints', async () => {
      if (authTokens.length === 0) {
        throw new Error('No auth tokens available for testing');
      }

      const endpoint = '/api/user/profile';
      const responseTimes = [];
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`);

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        expect(response.status).toBe(200);
      }

      const sortedTimes = responseTimes.sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(0.5 * iterations)];
      const p90 = sortedTimes[Math.floor(0.9 * iterations)];

      expect(p50).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p50);
      expect(p90).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p90);

      logger.info('Authenticated endpoint performance', {
        endpoint,
        p50, p90,
        average: responseTimes.reduce((a, b) => a + b, 0) / iterations
      });
    });

    test('should meet throughput requirements', async () => {
      const startTime = Date.now();
      const requests = [];
      const targetRequests = PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.THROUGHPUT.requestsPerSecond * 10;

      // Make concurrent requests
      for (let i = 0; i < targetRequests; i++) {
        requests.push(
          request(app)
            .get('/health')
            .then(response => ({ success: response.status === 200 }))
            .catch(error => ({ success: false, error: error.message }))
        );
      }

      const results = await Promise.all(requests);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const actualRPS = targetRequests / duration;
      const successCount = results.filter(r => r.success).length;
      const errorRate = ((targetRequests - successCount) / targetRequests) * 100;

      expect(actualRPS).toBeGreaterThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.THROUGHPUT.requestsPerSecond);
      expect(errorRate).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage);

      logger.info('Throughput test results', {
        targetRPS: PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.THROUGHPUT.requestsPerSecond,
        actualRPS: actualRPS,
        duration: duration,
        successCount: successCount,
        errorRate: errorRate
      });
    });
  });

  // Justification: Load Testing - Validate system performance under load
  // Provides testing of system performance under various load scenarios
  // Essential for capacity planning and scalability validation
  describe('Load Testing', () => {
    test('should handle normal load scenario', async () => {
      const scenario = PERFORMANCE_TEST_CONFIG.LOAD_SCENARIOS.NORMAL_LOAD;
      const results = await executeLoadTest(scenario);
      
      expect(results.success).toBe(true);
      expect(results.errorRate).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage);
      expect(results.avgResponseTime).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p90);
    });

    test('should handle peak load scenario', async () => {
      const scenario = PERFORMANCE_TEST_CONFIG.LOAD_SCENARIOS.PEAK_LOAD;
      const results = await executeLoadTest(scenario);
      
      expect(results.success).toBe(true);
      expect(results.errorRate).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage);
      expect(results.avgResponseTime).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p95);
    });

    test('should handle stress test scenario', async () => {
      const scenario = PERFORMANCE_TEST_CONFIG.LOAD_SCENARIOS.STRESS_TEST;
      const results = await executeLoadTest(scenario);
      
      // Stress test may have higher error rates but should not crash
      expect(results.success).toBe(true);
      expect(results.errorRate).toBeLessThan(5); // Allow up to 5% error rate under stress
    });

    test('should handle spike test scenario', async () => {
      const scenario = PERFORMANCE_TEST_CONFIG.LOAD_SCENARIOS.SPIKE_TEST;
      const results = await executeLoadTest(scenario);
      
      // Spike test should recover quickly
      expect(results.success).toBe(true);
      expect(results.recoveryTime).toBeLessThan(60); // Should recover within 60 seconds
    });
  });

  // Justification: Memory Performance Tests - Validate memory usage
  // Provides testing of memory usage and memory leaks
  // Essential for memory optimization and stability
  describe('Memory Performance', () => {
    test('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage();
      
      // Run a load test
      const scenario = PERFORMANCE_TEST_CONFIG.LOAD_SCENARIOS.NORMAL_LOAD;
      await executeLoadTest(scenario);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = ((finalMemory.heapUsed - initialMemory.heapUsed) / initialMemory.heapUsed) * 100;
      
      expect(memoryIncrease).toBeLessThan(50); // Should not increase by more than 50%
      
      logger.info('Memory usage test', {
        initialMemory: initialMemory.heapUsed / 1024 / 1024, // MB
        finalMemory: finalMemory.heapUsed / 1024 / 1024, // MB
        increase: memoryIncrease
      });
    });

    test('should not have memory leaks', async () => {
      const memorySnapshots = [];
      
      // Take memory snapshots over time
      for (let i = 0; i < 10; i++) {
        const memory = process.memoryUsage();
        memorySnapshots.push(memory.heapUsed);
        
        // Run some operations
        await request(app).get('/health');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check for consistent memory usage
      const firstSnapshot = memorySnapshots[0];
      const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
      const memoryGrowth = ((lastSnapshot - firstSnapshot) / firstSnapshot) * 100;
      
      expect(memoryGrowth).toBeLessThan(20); // Should not grow by more than 20%
    });
  });

  // Justification: Cache Performance Tests - Validate caching effectiveness
  // Provides testing of cache performance and hit rates
  // Essential for performance optimization validation
  describe('Cache Performance', () => {
    test('should demonstrate cache effectiveness', async () => {
      const endpoint = '/api/user/profile';
      const responseTimes = [];
      
      // First request (cache miss)
      const startTime1 = Date.now();
      const response1 = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${authTokens[0]}`);
      const time1 = Date.now() - startTime1;
      responseTimes.push(time1);
      
      // Second request (cache hit)
      const startTime2 = Date.now();
      const response2 = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${authTokens[0]}`);
      const time2 = Date.now() - startTime2;
      responseTimes.push(time2);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(time2).toBeLessThan(time1); // Cache hit should be faster
      
      // Check cache statistics
      const stats = CacheService.getStats('userCache');
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      
      logger.info('Cache performance test', {
        cacheMissTime: time1,
        cacheHitTime: time2,
        improvement: ((time1 - time2) / time1) * 100,
        cacheStats: stats
      });
    });

    test('should handle cache invalidation', async () => {
      const endpoint = '/api/user/profile';
      
      // Make initial request
      const response1 = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${authTokens[0]}`);
      
      // Update user data (should invalidate cache)
      await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .send({ name: 'Updated Name' });
      
      // Make another request (should be cache miss)
      const response2 = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${authTokens[0]}`);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response2.body.data.name).toBe('Updated Name');
    });
  });

  // Justification: Database Performance Tests - Validate database performance
  // Provides testing of database query performance and optimization
  // Essential for database performance validation
  describe('Database Performance', () => {
    test('should handle concurrent database operations', async () => {
      const operations = [];
      const concurrentOperations = 20;
      
      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(
          request(app)
            .get('/api/filing/list')
            .set('Authorization', `Bearer ${authTokens[i % authTokens.length]}`)
        );
      }
      
      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successCount = results.filter(r => r.status === 200).length;
      const errorRate = ((concurrentOperations - successCount) / concurrentOperations) * 100;
      
      expect(errorRate).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      logger.info('Database performance test', {
        concurrentOperations,
        successCount,
        errorRate,
        totalTime
      });
    });

    test('should optimize query performance', async () => {
      const queryTimes = [];
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/api/filing/list')
          .set('Authorization', `Bearer ${authTokens[0]}`)
          .query({ page: 1, limit: 50 });
        
        const endTime = Date.now();
        queryTimes.push(endTime - startTime);
        
        expect(response.status).toBe(200);
      }
      
      const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / iterations;
      expect(avgQueryTime).toBeLessThan(1000); // Should average less than 1 second
      
      logger.info('Query optimization test', {
        avgQueryTime,
        minQueryTime: Math.min(...queryTimes),
        maxQueryTime: Math.max(...queryTimes)
      });
    });
  });

  // Justification: Scalability Tests - Validate system scalability
  // Provides testing of system scalability and growth capacity
  // Essential for capacity planning and growth validation
  describe('Scalability', () => {
    test('should scale horizontally', async () => {
      // Simulate multiple instances by running concurrent requests
      const instances = 3;
      const requestsPerInstance = 50;
      const allRequests = [];
      
      for (let instance = 0; instance < instances; instance++) {
        for (let req = 0; req < requestsPerInstance; req++) {
          allRequests.push(
            request(app)
              .get('/health')
              .then(response => ({ instance, success: response.status === 200 }))
              .catch(error => ({ instance, success: false, error: error.message }))
          );
        }
      }
      
      const results = await Promise.all(allRequests);
      const successCount = results.filter(r => r.success).length;
      const errorRate = ((allRequests.length - successCount) / allRequests.length) * 100;
      
      expect(errorRate).toBeLessThan(PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage);
      
      logger.info('Horizontal scaling test', {
        instances,
        requestsPerInstance,
        totalRequests: allRequests.length,
        successCount,
        errorRate
      });
    });

    test('should handle increasing load gracefully', async () => {
      const loadLevels = [10, 25, 50, 100];
      const results = [];
      
      for (const load of loadLevels) {
        const startTime = Date.now();
        const requests = [];
        
        for (let i = 0; i < load; i++) {
          requests.push(
            request(app)
              .get('/health')
              .then(response => ({ success: response.status === 200 }))
              .catch(error => ({ success: false, error: error.message }))
          );
        }
        
        const requestResults = await Promise.all(requests);
        const endTime = Date.now();
        const duration = endTime - startTime;
        const successCount = requestResults.filter(r => r.success).length;
        const errorRate = ((load - successCount) / load) * 100;
        const rps = load / (duration / 1000);
        
        results.push({
          load,
          duration,
          successCount,
          errorRate,
          rps
        });
      }
      
      // Check that error rate doesn't increase significantly with load
      const maxErrorRate = Math.max(...results.map(r => r.errorRate));
      expect(maxErrorRate).toBeLessThan(5); // Should not exceed 5% error rate
      
      logger.info('Load scaling test', results);
    });
  });

  // Justification: Resource Monitoring Tests - Validate resource usage
  // Provides testing of system resource usage and monitoring
  // Essential for resource optimization and monitoring
  describe('Resource Monitoring', () => {
    test('should monitor system resources', async () => {
      const monitoringData = [];
      const monitoringDuration = 30; // seconds
      const interval = 5; // seconds
      
      for (let i = 0; i < monitoringDuration / interval; i++) {
        const memory = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        monitoringData.push({
          timestamp: new Date().toISOString(),
          memory: {
            heapUsed: memory.heapUsed / 1024 / 1024, // MB
            heapTotal: memory.heapTotal / 1024 / 1024, // MB
            external: memory.external / 1024 / 1024, // MB
            rss: memory.rss / 1024 / 1024 // MB
          },
          cpu: {
            user: cpuUsage.user / 1000000, // seconds
            system: cpuUsage.system / 1000000 // seconds
          }
        });
        
        // Run some load during monitoring
        await request(app).get('/health');
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }
      
      // Check resource usage patterns
      const memoryUsage = monitoringData.map(d => d.memory.heapUsed);
      const maxMemoryUsage = Math.max(...memoryUsage);
      const avgMemoryUsage = memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length;
      
      expect(maxMemoryUsage).toBeLessThan(500); // Should not exceed 500MB
      expect(avgMemoryUsage).toBeLessThan(300); // Should average less than 300MB
      
      logger.info('Resource monitoring test', {
        maxMemoryUsage,
        avgMemoryUsage,
        monitoringDuration,
        dataPoints: monitoringData.length
      });
    });
  });
});

// Justification: Load Test Execution Functions - Execute load tests
// Provides functions to execute and monitor load tests
// Essential for automated load testing
async function executeLoadTest(scenario) {
  const results = {
    scenario: scenario.name,
    success: false,
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    responseTimes: [],
    errorRate: 0,
    avgResponseTime: 0,
    recoveryTime: 0
  };

  const startTime = Date.now();
  const requests = [];
  
  // Create concurrent users
  for (let user = 0; user < scenario.concurrentUsers; user++) {
    for (let req = 0; req < scenario.requestsPerUser; req++) {
      const requestPromise = makeTestRequest(user, req);
      requests.push(requestPromise);
    }
  }
  
  // Execute all requests
  const requestResults = await Promise.all(requests);
  const endTime = Date.now();
  
  // Process results
  results.totalRequests = requestResults.length;
  results.successCount = requestResults.filter(r => r.success).length;
  results.errorCount = results.totalRequests - results.successCount;
  results.errorRate = (results.errorCount / results.totalRequests) * 100;
  results.responseTimes = requestResults.map(r => r.responseTime).filter(t => t !== null);
  results.avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  
  // Determine success based on thresholds
  results.success = results.errorRate < PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage &&
                   results.avgResponseTime < PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.RESPONSE_TIME.p95;
  
  // Calculate recovery time for spike tests
  if (scenario.name === 'Spike Test') {
    results.recoveryTime = calculateRecoveryTime(requestResults);
  }
  
  logger.info(`Load test completed: ${scenario.name}`, results);
  
  return results;
}

// Justification: Test Request Function - Make individual test requests
// Provides function to make individual test requests with timing
// Essential for load test execution
async function makeTestRequest(userId, requestId) {
  const startTime = Date.now();
  
  try {
    const endpoint = PERFORMANCE_TEST_CONFIG.TEST_ENDPOINTS[requestId % PERFORMANCE_TEST_CONFIG.TEST_ENDPOINTS.length];
    
    let response;
    if (endpoint === '/api/user/profile' && authTokens.length > 0) {
      response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${authTokens[userId % authTokens.length]}`);
    } else {
      response = await request(app).get(endpoint);
    }
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: response.status === 200,
      responseTime: responseTime,
      status: response.status
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      responseTime: responseTime,
      error: error.message
    };
  }
}

// Justification: Recovery Time Calculation - Calculate system recovery time
// Provides function to calculate system recovery time after load
// Essential for spike test validation
function calculateRecoveryTime(requestResults) {
  // Group requests by time and check when error rate returns to normal
  const timeGroups = {};
  
  requestResults.forEach((result, index) => {
    const timeSlot = Math.floor(index / 10); // Group every 10 requests
    if (!timeGroups[timeSlot]) {
      timeGroups[timeSlot] = [];
    }
    timeGroups[timeSlot].push(result);
  });
  
  let recoverySlot = 0;
  for (const [slot, requests] of Object.entries(timeGroups)) {
    const errorRate = (requests.filter(r => !r.success).length / requests.length) * 100;
    if (errorRate < PERFORMANCE_TEST_CONFIG.PERFORMANCE_THRESHOLDS.ERROR_RATE.maxPercentage) {
      recoverySlot = parseInt(slot);
      break;
    }
  }
  
  return recoverySlot * 10; // Convert back to request count
}

// Justification: Test User Creation - Create test users for performance testing
// Provides function to create test users for authenticated performance tests
// Essential for performance test setup
async function createTestUsers(count, testUsersArray, authTokensArray) {
  for (let i = 0; i < count; i++) {
    const userData = {
      name: `Performance Test User ${i}`,
      email: `perf.test.${i}.${Date.now()}@example.com`,
      mobile: `9876543${i.toString().padStart(3, '0')}`,
      pan: `ABCDE${i.toString().padStart(4, '0')}F`,
      password: 'TestPass123!'
    };
    
    try {
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      if (userResponse.status === 201) {
        testUsersArray.push(userResponse.body.data);
        
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password
          });
        
        if (loginResponse.status === 200) {
          authTokensArray.push(loginResponse.body.data.token);
        }
      }
    } catch (error) {
      logger.error(`Failed to create test user ${i}:`, error);
    }
  }
  
  logger.info(`Created ${testUsersArray.length} test users with ${authTokensArray.length} auth tokens`);
}
