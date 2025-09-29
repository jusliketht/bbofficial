const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function fixUsersTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing Users Table Schema...');
    
    // Drop the existing users table and recreate with correct schema
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    
    // Create users table with correct schema as per documentation
    await client.query(`
      CREATE TABLE users (
        user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        pan VARCHAR(10) UNIQUE NOT NULL,
        aadhaar VARCHAR(12),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'CA', 'admin', 'entity', 'super_admin', 'ca_firm_admin')),
        ca_id UUID,
        password_hash VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
        consent_status JSONB DEFAULT '{"current": true, "timestamp": null}'::jsonb,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✅ Users table recreated with correct schema');
    
    // Check the new structure
    const userColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n👥 New Users table structure:');
    userColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error);
    throw error;
  } finally {
    client.release();
  }
}

fixUsersTable()
  .then(() => {
    console.log('✅ Users table fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Users table fix failed:', error);
    process.exit(1);
  });
