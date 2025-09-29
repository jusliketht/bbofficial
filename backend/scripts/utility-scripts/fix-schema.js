// Fix missing ack_number column in filings table
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function fixSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing ack_number column to filings table
    console.log('1. Adding ack_number column to filings table...');
    await client.query(`
      ALTER TABLE filings 
      ADD COLUMN IF NOT EXISTS ack_number VARCHAR(20)
    `);
    console.log('✅ ack_number column added to filings table');
    
    // Verify the column was added
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'filings' AND column_name = 'ack_number'
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ ack_number column verified:', verifyResult.rows[0]);
    } else {
      console.log('❌ ack_number column still missing');
    }
    
    // Test the filing submission functionality
    console.log('\n2. Testing filing submission functionality...');
    
    // Create test user
    const testUser = await client.query(`
      INSERT INTO users (user_id, name, email, mobile, pan, password_hash, role)
      VALUES (gen_random_uuid(), 'Schema Fix Test User', 'schemafix@test.com', '9876543210', 'TEST1234A', 'test_hash', 'user')
      RETURNING user_id
    `);
    console.log('✅ Test user created');
    
    // Create test filing
    const testFiling = await client.query(`
      INSERT INTO filings (filing_id, user_id, assessment_year, filing_for, itr_type, status)
      VALUES (gen_random_uuid(), $1, '2024-25', 'self', 'ITR-1', 'draft')
      RETURNING filing_id
    `, [testUser.rows[0].user_id]);
    console.log('✅ Test filing created');
    
    // Test ack_number update (simulating filing submission)
    const updateResult = await client.query(`
      UPDATE filings 
      SET ack_number = 'TEST123456', submitted_at = NOW(), status = 'submitted'
      WHERE filing_id = $1
      RETURNING ack_number, status
    `, [testFiling.rows[0].filing_id]);
    console.log('✅ ack_number update test passed:', updateResult.rows[0]);
    
    // Clean up test data
    await client.query('DELETE FROM filings WHERE filing_id = $1', [testFiling.rows[0].filing_id]);
    await client.query('DELETE FROM users WHERE user_id = $1', [testUser.rows[0].user_id]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

fixSchema();
