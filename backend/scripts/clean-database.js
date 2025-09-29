// Justification: Database Cleanup Script - Phase 4 Testing Enhancement
// Provides database cleanup for testing environment
// Essential for ensuring clean test database state
// Prevents test data conflicts and ensures consistent test results

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack_itr',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function cleanDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Cleaning database for testing...');
    
    // Drop all tables in correct order
    await client.query('DROP TABLE IF EXISTS bulk_jobs CASCADE;');
    await client.query('DROP TABLE IF EXISTS ca_assignments CASCADE;');
    await client.query('DROP TABLE IF EXISTS consent_log CASCADE;');
    await client.query('DROP TABLE IF EXISTS audit_trail CASCADE;');
    await client.query('DROP TABLE IF EXISTS ca_firms CASCADE;');
    await client.query('DROP TABLE IF EXISTS document_uploads CASCADE;');
    await client.query('DROP TABLE IF EXISTS verification_sessions CASCADE;');
    await client.query('DROP TABLE IF EXISTS filing_declarations CASCADE;');
    await client.query('DROP TABLE IF EXISTS tax_computations CASCADE;');
    await client.query('DROP TABLE IF EXISTS intake_data CASCADE;');
    await client.query('DROP TABLE IF EXISTS filings CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    
    console.log('✅ Database cleaned successfully');
    
  } catch (error) {
    console.error('❌ Failed to clean database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// CLI usage
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('Database cleanup completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanDatabase };
