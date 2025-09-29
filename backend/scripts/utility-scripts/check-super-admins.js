// Justification: Super Admin Check Script - CRM Architecture Implementation
// Checks existing super admin accounts and their details
// Essential for platform administration and account management
// Provides visibility into existing admin accounts

const { Pool } = require('pg');
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

async function checkSuperAdmins() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Super Admin Accounts...');
    
    const query = `
      SELECT user_id, name, first_name, last_name, email, mobile, pan, role, status, created_at
      FROM users 
      WHERE role IN ('super_admin', 'admin', 'ca_firm_admin')
      ORDER BY role, created_at
    `;

    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin accounts found');
      return;
    }

    console.log(`✅ Found ${result.rows.length} admin account(s):`);
    console.log('');

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.toUpperCase()}:`);
      console.log(`   - User ID: ${user.user_id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Mobile: ${user.mobile}`);
      console.log(`   - PAN: ${user.pan}`);
      console.log(`   - Status: ${user.status}`);
      console.log(`   - Created: ${user.created_at}`);
      console.log('');
    });

    // Check for specific super admin
    const superAdminQuery = `
      SELECT user_id, name, email, role, status
      FROM users 
      WHERE email = 'superadmin@itrplatform.com' OR email = 'admin@itrplatform.com'
    `;

    const superAdminResult = await client.query(superAdminQuery);
    
    if (superAdminResult.rows.length > 0) {
      console.log('🎯 Default Super Admin Accounts:');
      superAdminResult.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.status}`);
      });
    } else {
      console.log('⚠️  No default super admin accounts found');
    }

  } catch (error) {
    console.error('❌ Error checking super admins:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await checkSuperAdmins();
  } catch (error) {
    console.error('❌ Failed to check super admins:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkSuperAdmins };
