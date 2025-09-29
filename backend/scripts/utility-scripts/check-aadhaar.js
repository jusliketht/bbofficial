// Quick schema check for aadhaar column
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function checkSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking users table schema...');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if aadhaar column exists
    const aadhaarCheck = result.rows.find(row => row.column_name === 'aadhaar');
    if (aadhaarCheck) {
      console.log('✅ aadhaar column exists');
    } else {
      console.log('❌ aadhaar column missing - adding it...');
      
      // Add the aadhaar column
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS aadhaar VARCHAR(12)
      `);
      console.log('✅ aadhaar column added');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

checkSchema();
