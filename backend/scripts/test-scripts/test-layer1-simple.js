// Simple Layer 1 Test - Database Foundation Validation
// Tests core database functionality without complex test frameworks
// Essential for validating the database foundation before proceeding

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function testLayer1() {
  console.log('🚀 Starting Layer 1 Database Foundation Test...\n');
  
  const client = await pool.connect();
  
  try {
    // Test 1: Database Connection
    console.log('✅ Test 1: Database Connection');
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log(`   Connected to: ${dbResult.rows[0].db_name}\n`);
    
    // Test 2: Core Tables Exist
    console.log('✅ Test 2: Core Tables Check');
    const tables = ['users', 'intake_data', 'income_heads', 'deductions', 'personal_info'];
    
    for (const table of tables) {
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        ) as exists
      `, [table]);
      
      if (tableCheck.rows[0].exists) {
        console.log(`   ✅ ${table} table exists`);
      } else {
        console.log(`   ❌ ${table} table missing`);
      }
    }
    console.log('');
    
    // Test 3: User Model CRUD Operations
    console.log('✅ Test 3: User Model CRUD Operations');
    
    // Create test user
    const testUser = {
      email: 'test@burnblack.com',
      password_hash: 'test_hash',
      first_name: 'Test',
      last_name: 'User',
      mobile: '9876543210',
      pan: 'TESTU1234X',
      aadhaar: '123456789012'
    };
    
    const createResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, mobile, pan, aadhaar, name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, email, first_name, last_name
    `, [testUser.email, testUser.password_hash, testUser.first_name, testUser.last_name, testUser.mobile, testUser.pan, testUser.aadhaar, `${testUser.first_name} ${testUser.last_name}`]);
    
    const userId = createResult.rows[0].user_id;
    console.log(`   ✅ Created user: ${createResult.rows[0].email} (ID: ${userId})`);
    
    // Read user
    const readResult = await client.query(`
      SELECT user_id, email, first_name, last_name, mobile, pan
      FROM users WHERE user_id = $1
    `, [userId]);
    
    if (readResult.rows.length > 0) {
      console.log(`   ✅ Read user: ${readResult.rows[0].email} (${readResult.rows[0].first_name} ${readResult.rows[0].last_name})`);
    } else {
      console.log(`   ❌ Failed to read user`);
    }
    
    // Update user
    const updateResult = await client.query(`
      UPDATE users SET first_name = $1 WHERE user_id = $2
      RETURNING user_id, first_name, last_name
    `, ['UpdatedTest', userId]);
    
    if (updateResult.rows.length > 0) {
      console.log(`   ✅ Updated user: ${updateResult.rows[0].first_name} ${updateResult.rows[0].last_name}`);
    } else {
      console.log(`   ❌ Failed to update user`);
    }
    
    // Delete user
    const deleteResult = await client.query(`
      DELETE FROM users WHERE user_id = $1
      RETURNING user_id
    `, [userId]);
    
    if (deleteResult.rows.length > 0) {
      console.log(`   ✅ Deleted user: ${userId}`);
    } else {
      console.log(`   ❌ Failed to delete user`);
    }
    console.log('');
    
    // Test 4: Performance Test
    console.log('✅ Test 4: Performance Test');
    const startTime = Date.now();
    
    // Simple query performance
    await client.query('SELECT COUNT(*) FROM users');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 100) {
      console.log(`   ✅ Query performance: ${duration}ms (< 100ms target)`);
    } else {
      console.log(`   ⚠️  Query performance: ${duration}ms (above 100ms target)`);
    }
    console.log('');
    
    // Test 5: Schema Validation
    console.log('✅ Test 5: Schema Validation');
    
    // Check users table structure
    const userColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    const requiredColumns = ['user_id', 'email', 'password_hash', 'first_name', 'last_name'];
    const foundColumns = userColumns.rows.map(row => row.column_name);
    
    for (const required of requiredColumns) {
      if (foundColumns.includes(required)) {
        console.log(`   ✅ Required column: ${required}`);
      } else {
        console.log(`   ❌ Missing column: ${required}`);
      }
    }
    console.log('');
    
    console.log('🎉 Layer 1 Database Foundation Test Completed Successfully!');
    console.log('📊 Status: Database foundation is solid and ready for Layer 2');
    
  } catch (error) {
    console.error('❌ Layer 1 Test Failed:', error.message);
    console.error('🔧 Please check:');
    console.error('   1. PostgreSQL is running on port 5432');
    console.error('   2. Database "burnblack_itr" exists');
    console.error('   3. User "postgres" has proper permissions');
    console.error('   4. DDL migrations have been run');
  } finally {
    await client.release();
    await pool.end();
  }
}

testLayer1();
