// Quick database connection test
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function testConnection() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Check current database
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log(`Connected to database: ${dbResult.rows[0].db_name}`);
    
    // Check users table ca_id column
    const caIdCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'ca_id'
    `);
    
    if (caIdCheck.rows.length > 0) {
      console.log('✅ ca_id column exists in users table');
    } else {
      console.log('❌ ca_id column missing from users table');
    }
    
    // Check all users table columns
    const allColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    allColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

testConnection();
