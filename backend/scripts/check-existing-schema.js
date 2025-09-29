const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkExistingSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking existing database schema...');
    
    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check filing_submissions table structure
    const filingSubmissionsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'filing_submissions'
      ORDER BY ordinal_position;
    `);
    
    if (filingSubmissionsResult.rows.length > 0) {
      console.log('\n📊 filing_submissions table structure:');
      filingSubmissionsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('\n❌ filing_submissions table does not exist');
    }
    
    // Check document_uploads table structure
    const documentUploadsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'document_uploads'
      ORDER BY ordinal_position;
    `);
    
    if (documentUploadsResult.rows.length > 0) {
      console.log('\n📄 document_uploads table structure:');
      documentUploadsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('\n❌ document_uploads table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the check
checkExistingSchema()
  .then(() => {
    console.log('\n✅ Schema check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema check failed:', error);
    process.exit(1);
  });
