const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function debugDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Database Connection Debug');
    console.log('='.repeat(50));
    
    // Check connection info
    const dbInfo = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Connection Details:');
    console.log(`   Database: ${dbInfo.rows[0].current_database}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    console.log(`   PostgreSQL Version: ${dbInfo.rows[0].version.split(' ')[0]}`);
    
    console.log('\n' + '='.repeat(50));
    
    // Count tables
    const tableCount = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📋 Total Tables: ${tableCount.rows[0].table_count}`);
    
    // Count users
    const userCount = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`👥 Total Users: ${userCount.rows[0].user_count}`);
    
    console.log('\n' + '='.repeat(50));
    
    // Show all users with details
    console.log('👥 ALL USERS IN DATABASE:');
    const users = await client.query(`
      SELECT user_id, email, name, role, email_verified, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    if (users.rows.length === 0) {
      console.log('   ❌ NO USERS FOUND!');
    } else {
      users.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      - Name: ${user.name}`);
        console.log(`      - Role: ${user.role}`);
        console.log(`      - Email Verified: ${user.email_verified}`);
        console.log(`      - Active: ${user.is_active}`);
        console.log(`      - Created: ${user.created_at}`);
        console.log(`      - User ID: ${user.user_id}`);
        console.log('');
      });
    }
    
    console.log('='.repeat(50));
    
    // Show table names
    console.log('📋 ALL TABLES:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.rows.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

debugDatabase();
