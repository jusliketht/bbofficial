// Migration script to add first_name and last_name columns to users table
// This improves data structure and user experience

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function addNameColumns() {
  console.log('🔄 Adding first_name and last_name columns to users table...\n');
  
  const client = await pool.connect();
  
  try {
    // Check if columns already exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('first_name', 'last_name')
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ first_name and last_name columns already exist');
      return;
    }
    
    // Add first_name and last_name columns
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN first_name VARCHAR(100),
      ADD COLUMN last_name VARCHAR(100)
    `);
    
    console.log('✅ Added first_name and last_name columns');
    
    // Update existing records to split the name field
    const updateResult = await client.query(`
      UPDATE users 
      SET 
        first_name = SPLIT_PART(name, ' ', 1),
        last_name = CASE 
          WHEN POSITION(' ' IN name) > 0 
          THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
          ELSE ''
        END
      WHERE first_name IS NULL OR last_name IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} existing user records`);
    
    // Make columns NOT NULL after populating data
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN first_name SET NOT NULL,
      ALTER COLUMN last_name SET NOT NULL
    `);
    
    console.log('✅ Made first_name and last_name NOT NULL');
    
    // Add indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
      CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
    `);
    
    console.log('✅ Added indexes for first_name and last_name');
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Users table now has separate first_name and last_name columns');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.release();
    await pool.end();
  }
}

addNameColumns();
