#!/usr/bin/env node

// Justification: Layer 1 Database Testing - Foundation Layer Validation
// Tests database schema, models, and basic CRUD operations
// Essential for ensuring solid foundation before building upper layers
// Validates DDL schema integrity and model functionality

const db = require('./src/config/database');
const User = require('./src/models/User_DDL');
const { logger } = require('./src/utils/logger');

class DatabaseLayerTester {
  constructor() {
    this.results = {
      connection: false,
      schema: false,
      models: false,
      crud: false
    };
    this.testData = {
      createdUsers: [],
      createdRecords: []
    };
  }

  // Best Practice: Cleanup method for test isolation
  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Clean up created users
      for (const userId of this.testData.createdUsers) {
        await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
      }
      
      // Clean up any other test records
      for (const record of this.testData.createdRecords) {
        await db.query(record.deleteQuery, record.params);
      }
      
      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.log(`⚠️ Cleanup warning: ${error.message}`);
    }
  }

  async testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...');
    
    try {
      const result = await db.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful');
      console.log(`   Current time: ${result.rows[0].current_time}`);
      this.results.connection = true;
      return true;
    } catch (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      this.results.connection = false;
      return false;
    }
  }

  async testSchemaIntegrity() {
    console.log('🔍 Testing Schema Integrity...');
    
    try {
      // Check if all required tables exist
      const requiredTables = [
        'users', 'assessment_years', 'itr_forms', 'intake_data',
        'income_heads', 'deductions', 'documents', 'audit_events',
        'consent_logs', 'tax_computations', 'user_sessions'
      ];

      const tableCheckPromises = requiredTables.map(async (table) => {
        const result = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        return { table, exists: result.rows[0].exists };
      });

      const tableResults = await Promise.all(tableCheckPromises);
      const missingTables = tableResults.filter(r => !r.exists);

      if (missingTables.length === 0) {
        console.log('✅ All required tables exist');
        this.results.schema = true;
        return true;
      } else {
        console.log('❌ Missing tables:', missingTables.map(t => t.table).join(', '));
        this.results.schema = false;
        return false;
      }
    } catch (error) {
      console.log(`❌ Schema integrity test failed: ${error.message}`);
      this.results.schema = false;
      return false;
    }
  }

  async testUserModel() {
    console.log('🔍 Testing User Model...');
    
    try {
      // Generate unique test data to avoid conflicts
      const timestamp = Date.now();
      const testUserData = {
        pan: `TEST${timestamp.toString().slice(-6)}A`, // Unique PAN
        mobile: `987654${timestamp.toString().slice(-4)}`, // Unique mobile
        email: `test${timestamp}@example.com`, // Unique email
        consent_timestamp: new Date(),
        consent_ip: '127.0.0.1',
        locale: 'en'
      };

      console.log(`   Using test PAN: ${testUserData.pan}`);
      const user = await User.create(testUserData);
      
      if (user && user.user_id) {
        console.log('✅ User creation successful');
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   PAN: ${user.pan}`);
        
        // Track for cleanup
        this.testData.createdUsers.push(user.user_id);
        
        // Test user retrieval
        const retrievedUser = await User.findByPan(testUserData.pan);
        if (retrievedUser && retrievedUser.user_id === user.user_id) {
          console.log('✅ User retrieval successful');
          
          // Test user update
          const updatedUser = await User.update(user.user_id, { locale: 'hi' });
          if (updatedUser && updatedUser.locale === 'hi') {
            console.log('✅ User update successful');
            
            this.results.models = true;
            return true;
          } else {
            console.log('❌ User update failed');
            this.results.models = false;
            return false;
          }
        } else {
          console.log('❌ User retrieval failed');
          this.results.models = false;
          return false;
        }
      } else {
        console.log('❌ User creation failed');
        this.results.models = false;
        return false;
      }
    } catch (error) {
      console.log(`❌ User model test failed: ${error.message}`);
      this.results.models = false;
      return false;
    }
  }

  async testBasicCRUD() {
    console.log('🔍 Testing Basic CRUD Operations...');
    
    try {
      // Test INSERT
      const insertResult = await db.query(`
        INSERT INTO users (user_id, pan, mobile_hash, email_hash, consent_timestamp, consent_ip, locale, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING user_id, pan
      `, [
        'test-user-id-123',
        'TEST1234A',
        'hashed-mobile',
        'hashed-email',
        new Date(),
        '127.0.0.1',
        'en',
        new Date(),
        new Date()
      ]);

      if (insertResult.rows.length > 0) {
        console.log('✅ INSERT operation successful');
        
        // Test SELECT
        const selectResult = await db.query('SELECT * FROM users WHERE user_id = $1', ['test-user-id-123']);
        if (selectResult.rows.length > 0) {
          console.log('✅ SELECT operation successful');
          
          // Test UPDATE
          const updateResult = await db.query('UPDATE users SET locale = $1 WHERE user_id = $2 RETURNING locale', ['hi', 'test-user-id-123']);
          if (updateResult.rows.length > 0 && updateResult.rows[0].locale === 'hi') {
            console.log('✅ UPDATE operation successful');
            
            // Test DELETE
            const deleteResult = await db.query('DELETE FROM users WHERE user_id = $1', ['test-user-id-123']);
            if (deleteResult.rowCount > 0) {
              console.log('✅ DELETE operation successful');
              this.results.crud = true;
              return true;
            } else {
              console.log('❌ DELETE operation failed');
            }
          } else {
            console.log('❌ UPDATE operation failed');
          }
        } else {
          console.log('❌ SELECT operation failed');
        }
      } else {
        console.log('❌ INSERT operation failed');
      }
      
      this.results.crud = false;
      return false;
    } catch (error) {
      console.log(`❌ CRUD operations test failed: ${error.message}`);
      this.results.crud = false;
      return false;
    }
  }

  async runAllTests() {
    const startTime = Date.now();
    console.log('🏗️ LAYER 1: DATABASE SCHEMA & MODELS TESTING');
    console.log('==============================================\n');

    try {
      // Test database connection
      const connectionStart = Date.now();
      const connectionOk = await this.testDatabaseConnection();
      const connectionTime = Date.now() - connectionStart;
      console.log(`   ⏱️ Connection test: ${connectionTime}ms\n`);
      
      if (!connectionOk) {
        console.log('❌ Database connection failed. Cannot proceed with other tests.');
        return false;
      }

      // Test schema integrity
      const schemaStart = Date.now();
      const schemaOk = await this.testSchemaIntegrity();
      const schemaTime = Date.now() - schemaStart;
      console.log(`   ⏱️ Schema test: ${schemaTime}ms\n`);
      
      if (!schemaOk) {
        console.log('❌ Schema integrity failed. Run migration first.');
        return false;
      }

      // Test user model
      const modelStart = Date.now();
      const modelOk = await this.testUserModel();
      const modelTime = Date.now() - modelStart;
      console.log(`   ⏱️ Model test: ${modelTime}ms\n`);
      
      if (!modelOk) {
        console.log('❌ User model failed. Check model implementation.');
        return false;
      }

      // Test basic CRUD
      const crudStart = Date.now();
      const crudOk = await this.testBasicCRUD();
      const crudTime = Date.now() - crudStart;
      console.log(`   ⏱️ CRUD test: ${crudTime}ms\n`);
      
      if (!crudOk) {
        console.log('❌ CRUD operations failed. Check database permissions.');
        return false;
      }

      // Performance Summary
      const totalTime = Date.now() - startTime;
      console.log('📊 LAYER 1 TEST RESULTS:');
      console.log('========================');
      console.log(`   ${this.results.connection ? '✅' : '❌'} Database Connection (${connectionTime}ms)`);
      console.log(`   ${this.results.schema ? '✅' : '❌'} Schema Integrity (${schemaTime}ms)`);
      console.log(`   ${this.results.models ? '✅' : '❌'} User Model (${modelTime}ms)`);
      console.log(`   ${this.results.crud ? '✅' : '❌'} CRUD Operations (${crudTime}ms)`);
      console.log(`   ⏱️ Total Test Time: ${totalTime}ms`);
      console.log('');
      
      const allPassed = Object.values(this.results).every(result => result === true);
      
      if (allPassed) {
        console.log('🎉 LAYER 1 PASSED! Database foundation is solid.');
        console.log('   Ready to proceed to Layer 2: Core Services');
        console.log(`   Performance: ${totalTime}ms (Target: <5000ms)`);
      } else {
        console.log('⚠️ LAYER 1 FAILED! Fix database issues before proceeding.');
      }

      return allPassed;

    } finally {
      // Best Practice: Always cleanup test data
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DatabaseLayerTester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseLayerTester;
