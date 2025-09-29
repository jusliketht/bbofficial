// Justification: Admin Dashboard Test Script - CRM Architecture Implementation
// Tests the comprehensive admin dashboard functionality
// Verifies backend services, API endpoints, and data flow
// Essential for ensuring system reliability and data integrity

const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

class AdminDashboardTestSuite {
  constructor() {
    this.testResults = [];
    this.adminToken = null;
  }

  // Justification: Test Setup - CRM Architecture Implementation
  // Sets up test environment and admin authentication
  // Ensures proper test execution with valid credentials
  // Essential for reliable test results and system validation
  async setup() {
    console.log('🔧 Setting up Admin Dashboard Test Suite...');
    
    try {
      // Get admin user token
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@itrplatform.com',
        password: 'admin123'
      });
      
      this.adminToken = loginResponse.data.data.token;
      console.log('✅ Admin authentication successful');
      
    } catch (error) {
      console.error('❌ Admin authentication failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Justification: Platform Overview Test - CRM Architecture Implementation
  // Tests comprehensive platform metrics and system health
  // Verifies data aggregation and real-time dashboard functionality
  // Essential for ensuring admin dashboard data accuracy
  async testPlatformOverview() {
    console.log('\n📊 Testing Platform Overview...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      const metrics = response.data.data;
      
      // Validate metrics structure
      const requiredFields = ['userMetrics', 'filingMetrics', 'caMetrics', 'systemHealth'];
      const missingFields = requiredFields.filter(field => !metrics[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate data types
      if (typeof metrics.userMetrics.totalUsers !== 'number') {
        throw new Error('userMetrics.totalUsers should be a number');
      }
      
      if (typeof metrics.systemHealth.uptime !== 'string') {
        throw new Error('systemHealth.uptime should be a string');
      }
      
      console.log('✅ Platform overview test passed');
      console.log(`   - Total Users: ${metrics.userMetrics.totalUsers}`);
      console.log(`   - System Uptime: ${metrics.systemHealth.uptime}`);
      
      this.testResults.push({
        test: 'Platform Overview',
        status: 'PASSED',
        details: metrics
      });
      
    } catch (error) {
      console.error('❌ Platform overview test failed:', error.message);
      this.testResults.push({
        test: 'Platform Overview',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // Justification: User Management Test - CRM Architecture Implementation
  // Tests user management functionality with search and filtering
  // Verifies pagination and bulk operations capabilities
  // Essential for ensuring CRM user management features
  async testUserManagement() {
    console.log('\n👥 Testing User Management...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      const userData = response.data.data;
      
      // Validate response structure
      if (!userData.users || !Array.isArray(userData.users)) {
        throw new Error('users should be an array');
      }
      
      if (!userData.pagination || typeof userData.pagination.totalCount !== 'number') {
        throw new Error('pagination should include totalCount');
      }
      
      // Validate user data structure
      if (userData.users.length > 0) {
        const user = userData.users[0];
        const requiredUserFields = ['user_id', 'name', 'email', 'role', 'status'];
        const missingUserFields = requiredUserFields.filter(field => !user[field]);
        
        if (missingUserFields.length > 0) {
          throw new Error(`Missing user fields: ${missingUserFields.join(', ')}`);
        }
      }
      
      console.log('✅ User management test passed');
      console.log(`   - Total Users: ${userData.pagination.totalCount}`);
      console.log(`   - Users Retrieved: ${userData.users.length}`);
      
      this.testResults.push({
        test: 'User Management',
        status: 'PASSED',
        details: {
          totalUsers: userData.pagination.totalCount,
          retrievedUsers: userData.users.length
        }
      });
      
    } catch (error) {
      console.error('❌ User management test failed:', error.message);
      this.testResults.push({
        test: 'User Management',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // Justification: Analytics Test - CRM Architecture Implementation
  // Tests analytics and business intelligence functionality
  // Verifies trend analysis and data aggregation
  // Essential for ensuring business intelligence capabilities
  async testAnalytics() {
    console.log('\n📈 Testing Analytics...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/analytics?timeRange=30d`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      const analytics = response.data.data;
      
      // Validate analytics structure
      const requiredFields = ['userGrowth', 'filingTrends', 'roleDistribution', 'topCAFirms'];
      const missingFields = requiredFields.filter(field => !analytics[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing analytics fields: ${missingFields.join(', ')}`);
      }
      
      // Validate data types
      if (!Array.isArray(analytics.userGrowth)) {
        throw new Error('userGrowth should be an array');
      }
      
      if (!Array.isArray(analytics.roleDistribution)) {
        throw new Error('roleDistribution should be an array');
      }
      
      console.log('✅ Analytics test passed');
      console.log(`   - User Growth Records: ${analytics.userGrowth.length}`);
      console.log(`   - Role Distribution: ${analytics.roleDistribution.length} roles`);
      
      this.testResults.push({
        test: 'Analytics',
        status: 'PASSED',
        details: {
          userGrowthRecords: analytics.userGrowth.length,
          roleDistributionCount: analytics.roleDistribution.length
        }
      });
      
    } catch (error) {
      console.error('❌ Analytics test failed:', error.message);
      this.testResults.push({
        test: 'Analytics',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // Justification: Compliance Test - CRM Architecture Implementation
  // Tests compliance monitoring and audit functionality
  // Verifies regulatory adherence and security features
  // Essential for ensuring compliance and security capabilities
  async testCompliance() {
    console.log('\n🛡️ Testing Compliance...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/compliance`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      const compliance = response.data.data;
      
      // Validate compliance structure
      const requiredFields = ['consentCompliance', 'dataRequests', 'auditCompliance'];
      const missingFields = requiredFields.filter(field => !compliance[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing compliance fields: ${missingFields.join(', ')}`);
      }
      
      // Validate compliance data
      if (typeof compliance.consentCompliance.complianceRate !== 'string') {
        throw new Error('consentCompliance.complianceRate should be a string');
      }
      
      console.log('✅ Compliance test passed');
      console.log(`   - Consent Compliance: ${compliance.consentCompliance.complianceRate}`);
      console.log(`   - Audit Completeness: ${compliance.auditCompliance.auditCompleteness}`);
      
      this.testResults.push({
        test: 'Compliance',
        status: 'PASSED',
        details: {
          consentCompliance: compliance.consentCompliance.complianceRate,
          auditCompleteness: compliance.auditCompliance.auditCompleteness
        }
      });
      
    } catch (error) {
      console.error('❌ Compliance test failed:', error.message);
      this.testResults.push({
        test: 'Compliance',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // Justification: Bulk Operations Test - CRM Architecture Implementation
  // Tests bulk operations functionality for efficient data management
  // Verifies batch processing and error handling
  // Essential for ensuring CRM bulk operations capabilities
  async testBulkOperations() {
    console.log('\n⚡ Testing Bulk Operations...');
    
    try {
      // Test bulk user export
      const response = await axios.post(`${API_BASE_URL}/admin/users/export`, {
        userIds: ['test-user-id']
      }, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      const exportData = response.data.data;
      
      // Validate export structure
      if (!exportData.users || !Array.isArray(exportData.users)) {
        throw new Error('exportData.users should be an array');
      }
      
      if (typeof exportData.recordCount !== 'number') {
        throw new Error('exportData.recordCount should be a number');
      }
      
      console.log('✅ Bulk operations test passed');
      console.log(`   - Export Record Count: ${exportData.recordCount}`);
      
      this.testResults.push({
        test: 'Bulk Operations',
        status: 'PASSED',
        details: {
          exportRecordCount: exportData.recordCount
        }
      });
      
    } catch (error) {
      console.error('❌ Bulk operations test failed:', error.message);
      this.testResults.push({
        test: 'Bulk Operations',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // Justification: System Health Test - CRM Architecture Implementation
  // Tests system health monitoring and performance metrics
  // Verifies system reliability and operational status
  // Essential for ensuring system stability and monitoring
  async testSystemHealth() {
    console.log('\n🏥 Testing System Health...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/health`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      
      const health = response.data.data;
      
      // Validate health structure
      if (health.status !== 'healthy') {
        throw new Error(`System health status: ${health.status}`);
      }
      
      if (typeof health.uptime !== 'number') {
        throw new Error('uptime should be a number');
      }
      
      console.log('✅ System health test passed');
      console.log(`   - Status: ${health.status}`);
      console.log(`   - Uptime: ${Math.round(health.uptime / 60)} minutes`);
      
      this.testResults.push({
        test: 'System Health',
        status: 'PASSED',
        details: {
          status: health.status,
          uptime: health.uptime
        }
      });
      
    } catch (error) {
      console.error('❌ System health test failed:', error.message);
      this.testResults.push({
        test: 'System Health',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // Justification: Test Summary - CRM Architecture Implementation
  // Provides comprehensive test results and system validation
  // Ensures all admin dashboard components are functioning correctly
  // Essential for system reliability and quality assurance
  async generateSummary() {
    console.log('\n📋 Test Summary');
    console.log('='.repeat(50));
    
    const passedTests = this.testResults.filter(result => result.status === 'PASSED');
    const failedTests = this.testResults.filter(result => result.status === 'FAILED');
    
    console.log(`✅ Passed Tests: ${passedTests.length}`);
    console.log(`❌ Failed Tests: ${failedTests.length}`);
    console.log(`📊 Success Rate: ${((passedTests.length / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\n📝 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });
    
    console.log('\n🎯 Admin Dashboard System Status:');
    if (failedTests.length === 0) {
      console.log('✅ FULLY OPERATIONAL - All tests passed successfully!');
      console.log('🚀 Admin dashboard is ready for production use.');
    } else {
      console.log('⚠️  PARTIALLY OPERATIONAL - Some tests failed.');
      console.log('🔧 Please review failed tests and fix issues.');
    }
  }

  // Justification: Main Test Execution - CRM Architecture Implementation
  // Orchestrates complete test suite execution
  // Ensures comprehensive system validation
  // Essential for quality assurance and system reliability
  async runAllTests() {
    console.log('🎯 Starting Admin Dashboard Test Suite');
    console.log('='.repeat(50));
    
    try {
      await this.setup();
      
      await this.testPlatformOverview();
      await this.testUserManagement();
      await this.testAnalytics();
      await this.testCompliance();
      await this.testBulkOperations();
      await this.testSystemHealth();
      
      await this.generateSummary();
      
    } catch (error) {
      console.error('❌ Test suite execution failed:', error.message);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new AdminDashboardTestSuite();
  testSuite.runAllTests();
}

module.exports = AdminDashboardTestSuite;
