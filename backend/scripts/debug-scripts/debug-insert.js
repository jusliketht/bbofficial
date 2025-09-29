// Debug script to identify the exact field causing the length issue
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack_itr',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testInsert() {
  const client = await pool.connect();

  try {
    console.log('🧪 Testing different INSERT approaches...');

    const user_id = uuidv4();
    const now = new Date();

    // Test 0: Check if we can insert into any table
    console.log('\n📝 Test 0: Testing other table');
    try {
      const result0 = await client.query(`
        INSERT INTO assessment_years (ay_code, ay_name, start_date, end_date, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ay_code, ay_name
      `, ['2024-25', 'Assessment Year 2024-25', '2024-04-01', '2025-03-31', true]);

      console.log('✅ Test 0 SUCCESS: Can insert into other tables');
    } catch (error) {
      console.log('❌ Test 0 FAILED: Cannot insert into other tables either:', error.message);
    }

    // Test 1: Minimal insert
    console.log('\n📝 Test 1: Minimal required fields');
    try {
      const result1 = await client.query(`
        INSERT INTO users (user_id, name, email, pan, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING user_id, name, email
      `, [user_id, 'Test User', 'test@example.com', 'TEST123456A', 'hashedpass', 'user', 'active']);

      console.log('✅ Test 1 SUCCESS:', result1.rows[0]);
      return;
    } catch (error) {
      console.log('❌ Test 1 FAILED:', error.message);
    }

    // Test 2: With mobile
    console.log('\n📝 Test 2: Adding mobile field');
    try {
      const result2 = await client.query(`
        INSERT INTO users (user_id, name, email, mobile, pan, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING user_id, name, email, mobile
      `, [uuidv4(), 'Test User 2', 'test2@example.com', '1234567890', 'TEST2123456A', 'hashedpass', 'user', 'active']);

      console.log('✅ Test 2 SUCCESS:', result2.rows[0]);
      return;
    } catch (error) {
      console.log('❌ Test 2 FAILED:', error.message);
    }

    // Test 3: With all fields
    console.log('\n📝 Test 3: All fields');
    try {
      const passwordHash = await bcrypt.hash('TestPass123!', 12);
      const result3 = await client.query(`
        INSERT INTO users (
          user_id, name, first_name, last_name, email, mobile, pan, aadhaar,
          password_hash, role, status, consent_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING user_id, name, email
      `, [
        uuidv4(),
        'Test User 3',
        'Test',
        'User',
        'test3@example.com',
        '1234567890',
        'TEST3123456A',
        '123456789012',
        passwordHash,
        'user',
        'active',
        JSON.stringify({ current: true }),
        now,
        now
      ]);

      console.log('✅ Test 3 SUCCESS:', result3.rows[0]);
      return;
    } catch (error) {
      console.log('❌ Test 3 FAILED:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testInsert();
