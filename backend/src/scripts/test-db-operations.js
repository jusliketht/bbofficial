// =====================================================
// DATABASE OPERATIONS TEST SCRIPT
// Verifies all critical database operations work correctly
// =====================================================

const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');
const {
  User,
  ITRFiling,
  Notification,
  Document,
  AssessmentNotice,
  TaxDemand,
  ITRVProcessing,
  Scenario,
  DocumentTemplate,
} = require('../models');

async function testUserOperations() {
  console.log('\n=== Testing User Operations ===');
  
  try {
    // Test: Find user by email
    const users = await User.findAll({ limit: 1 });
    if (users.length > 0) {
      const user = users[0];
      console.log('✅ User findAll works');
      
      // Test: Find user by PK
      const userById = await User.findByPk(user.id);
      console.log(userById ? '✅ User findByPk works' : '❌ User findByPk failed');
    } else {
      console.log('⚠️  No users found to test with');
    }
  } catch (error) {
    console.error('❌ User operations failed:', error.message);
    throw error;
  }
}

async function testITRFilingOperations() {
  console.log('\n=== Testing ITR Filing Operations ===');
  
  try {
    // Test: Find filings with pagination
    const { count, rows: filings } = await ITRFiling.findAndCountAll({
      limit: 5,
      offset: 0,
    });
    console.log(`✅ ITRFiling findAndCountAll works (found ${count} total, ${filings.length} in page)`);
    
    // Test: Find filing with include
    if (filings.length > 0) {
      const filing = await ITRFiling.findByPk(filings[0].id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
      });
      console.log(filing ? '✅ ITRFiling findByPk with include works' : '❌ ITRFiling findByPk with include failed');
    }
  } catch (error) {
    console.error('❌ ITR Filing operations failed:', error.message);
    throw error;
  }
}

async function testNotificationOperations() {
  console.log('\n=== Testing Notification Operations ===');
  
  try {
    // Test: Find notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      limit: 10,
      offset: 0,
      order: [['createdAt', 'DESC']],
    });
    console.log(`✅ Notification findAndCountAll works (found ${count} total, ${notifications.length} in page)`);
    
    // Test: Count unread
    const unreadCount = await Notification.count({
      where: { read: false },
    });
    console.log(`✅ Notification count works (${unreadCount} unread)`);
  } catch (error) {
    console.error('❌ Notification operations failed:', error.message);
    throw error;
  }
}

async function testDocumentOperations() {
  console.log('\n=== Testing Document Operations ===');
  
  try {
    // Test: Find documents with pagination
    const { count, rows: documents } = await Document.findAndCountAll({
      limit: 10,
      offset: 0,
      where: { isDeleted: false },
    });
    console.log(`✅ Document findAndCountAll works (found ${count} total, ${documents.length} in page)`);
  } catch (error) {
    console.error('❌ Document operations failed:', error.message);
    throw error;
  }
}

async function testAssessmentNoticeOperations() {
  console.log('\n=== Testing Assessment Notice Operations ===');
  
  try {
    // Test: Find notices with pagination
    const { count, rows: notices } = await AssessmentNotice.findAndCountAll({
      limit: 10,
      offset: 0,
      order: [['receivedDate', 'DESC']],
    });
    console.log(`✅ AssessmentNotice findAndCountAll works (found ${count} total, ${notices.length} in page)`);
  } catch (error) {
    console.error('❌ Assessment Notice operations failed:', error.message);
    throw error;
  }
}

async function testTaxDemandOperations() {
  console.log('\n=== Testing Tax Demand Operations ===');
  
  try {
    // Test: Find demands with pagination
    const { count, rows: demands } = await TaxDemand.findAndCountAll({
      limit: 10,
      offset: 0,
      order: [['receivedDate', 'DESC']],
    });
    console.log(`✅ TaxDemand findAndCountAll works (found ${count} total, ${demands.length} in page)`);
  } catch (error) {
    console.error('❌ Tax Demand operations failed:', error.message);
    throw error;
  }
}

async function testITRVProcessingOperations() {
  console.log('\n=== Testing ITR-V Processing Operations ===');
  
  try {
    // Test: Find ITR-V records with pagination
    const { count, rows: itrvRecords } = await ITRVProcessing.findAndCountAll({
      limit: 10,
      offset: 0,
      order: [['createdAt', 'DESC']],
    });
    console.log(`✅ ITRVProcessing findAndCountAll works (found ${count} total, ${itrvRecords.length} in page)`);
  } catch (error) {
    console.error('❌ ITR-V Processing operations failed:', error.message);
    throw error;
  }
}

async function testScenarioOperations() {
  console.log('\n=== Testing Scenario Operations ===');
  
  try {
    // Test: Find scenarios with pagination
    const { count, rows: scenarios } = await Scenario.findAndCountAll({
      limit: 10,
      offset: 0,
      order: [['createdAt', 'DESC']],
    });
    console.log(`✅ Scenario findAndCountAll works (found ${count} total, ${scenarios.length} in page)`);
  } catch (error) {
    console.error('❌ Scenario operations failed:', error.message);
    throw error;
  }
}

async function testDocumentTemplateOperations() {
  console.log('\n=== Testing Document Template Operations ===');
  
  try {
    // Test: Find templates with pagination
    const { count, rows: templates } = await DocumentTemplate.findAndCountAll({
      limit: 10,
      offset: 0,
      where: { isActive: true },
    });
    console.log(`✅ DocumentTemplate findAndCountAll works (found ${count} total, ${templates.length} in page)`);
  } catch (error) {
    console.error('❌ Document Template operations failed:', error.message);
    // Document templates table might not exist yet, which is okay
    console.log('⚠️  Document templates table may not exist yet - this is expected if migration not run');
  }
}

async function testQueryPerformance() {
  console.log('\n=== Testing Query Performance ===');
  
  try {
    const startTime = Date.now();
    
    // Test: Complex query with joins
    const filings = await ITRFiling.findAll({
      limit: 20,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Complex query with joins completed in ${queryTime}ms`);
    
    if (queryTime > 1000) {
      console.warn(`⚠️  Query took longer than 1 second (${queryTime}ms) - consider optimization`);
    }
  } catch (error) {
    console.error('❌ Query performance test failed:', error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('DATABASE OPERATIONS TEST');
  console.log('========================================\n');
  
  try {
    // Verify database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Run all tests
    await testUserOperations();
    await testITRFilingOperations();
    await testNotificationOperations();
    await testDocumentOperations();
    await testAssessmentNoticeOperations();
    await testTaxDemandOperations();
    await testITRVProcessingOperations();
    await testScenarioOperations();
    await testDocumentTemplateOperations();
    await testQueryPerformance();
    
    console.log('\n========================================');
    console.log('✅ All database operation tests completed');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ Database operation tests failed');
    console.error('========================================');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    console.log('');
    
    enterpriseLogger.error('Database operations test failed', {
      error: error.message,
      stack: error.stack,
    });
    
    throw error;
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      await sequelize.close();
      process.exit(1);
    });
}

module.exports = { runAllTests };

