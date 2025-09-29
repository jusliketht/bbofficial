const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verifySuperAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying super admin account...');
    
    // Get admin account details
    const adminResult = await client.query(`
      SELECT user_id, email, name, role, email_verified, is_active, password_hash, created_at
      FROM users 
      WHERE email = $1
    `, ['admin@burnblack.com']);
    
    if (adminResult.rows.length === 0) {
      console.log('❌ Super admin account not found!');
      return;
    }
    
    const admin = adminResult.rows[0];
    console.log('✅ Super admin account found:');
    console.log(`   - User ID: ${admin.user_id}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Name: ${admin.name}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - Email Verified: ${admin.email_verified}`);
    console.log(`   - Is Active: ${admin.is_active}`);
    console.log(`   - Created: ${admin.created_at}`);
    
    // Update email verification status
    if (!admin.email_verified) {
      console.log('🔧 Updating email verification status...');
      await client.query(`
        UPDATE users 
        SET email_verified = true, updated_at = NOW()
        WHERE user_id = $1
      `, [admin.user_id]);
      console.log('✅ Email verification status updated');
    }
    
    // Test password
    const testPassword = 'admin123';
    const passwordMatch = await bcrypt.compare(testPassword, admin.password_hash);
    
    console.log('\n📋 Super Admin Login Credentials:');
    console.log('   Email: admin@burnblack.com');
    console.log('   Password: admin123');
    console.log('   Role: super_admin');
    console.log(`   Password Status: ${passwordMatch ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Account Status: ${admin.is_active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Email Verified: ${admin.email_verified ? '✅ Verified' : '❌ Not Verified'}`);
    
    console.log('\n🔐 Security Information:');
    console.log('   - This is a super admin account with full platform access');
    console.log('   - Change the default password after first login');
    console.log('   - Use strong, unique passwords');
    console.log('   - Regularly review admin access logs');
    
    console.log('\n🎯 Platform Access:');
    console.log('   - Full administrative control');
    console.log('   - User management capabilities');
    console.log('   - System configuration access');
    console.log('   - All enterprise features enabled');
    
  } catch (error) {
    console.error('❌ Error verifying super admin:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

verifySuperAdmin();
